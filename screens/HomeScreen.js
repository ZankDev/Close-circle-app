import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  Modal,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { messageService, folderService } from '../api/databaseService';
import { supabase, getCurrentUserId } from '../utils/supabase';

const HomeScreen = ({ navigation, route }) => {
  const { user, token, phoneNumber, selectedPackage, categoryId } = route.params || {};

  // State
  const [drafts, setDrafts] = useState([]);
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showSubFolderModal, setShowSubFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userId = await getCurrentUserId();

      if (userId) {
        // Load from Supabase
        const [msgResult, folderResult] = await Promise.all([
          messageService.getUserMessages(userId),
          folderService.getUserFolders(userId),
        ]);

        const allMessages = msgResult.messages || [];
        setDrafts(allMessages.filter(m => m.status === 'draft'));
        setScheduledMessages(allMessages.filter(m => m.status === 'scheduled'));

        // Map Supabase folder shape to the shape the render functions expect
        const mapped = (folderResult.folders || []).map(f => ({
          id: f.id,
          name: f.name,
          parentId: f.parent_folder_id,
          createdAt: f.created_at,
          children: [],
          messages: allMessages.filter(m => m.folder_id === f.id),
        }));
        setFolders(mapped);
      } else {
        // Fallback to AsyncStorage for unauthenticated state
        const storedDrafts = await AsyncStorage.getItem('drafts');
        const storedScheduled = await AsyncStorage.getItem('scheduledMessages');
        const storedFolders = await AsyncStorage.getItem('userFolders');
        if (storedDrafts) setDrafts(JSON.parse(storedDrafts));
        if (storedScheduled) setScheduledMessages(JSON.parse(storedScheduled));
        if (storedFolders) setFolders(JSON.parse(storedFolders));
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'התנתק',
        onPress: async () => {
          await supabase.auth.signOut();
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  // Folder management — uses Supabase + local state update
  const createFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס שם לתיקיה');
      return;
    }

    try {
      const userId = await getCurrentUserId();
      if (userId) {
        const result = await folderService.createFolder(userId, newFolderName.trim(), parentFolderId || null);
        const newFolder = {
          id: result.folder.id,
          name: result.folder.name,
          parentId: result.folder.parent_folder_id,
          children: [],
          messages: [],
          createdAt: result.folder.created_at,
        };
        setFolders(prev => [...prev, newFolder]);
      } else {
        // AsyncStorage fallback
        const newFolder = {
          id: Date.now().toString(),
          name: newFolderName.trim(),
          parentId: parentFolderId,
          children: [],
          messages: [],
          createdAt: new Date().toISOString(),
        };
        const updated = [...folders, newFolder];
        setFolders(updated);
        await AsyncStorage.setItem('userFolders', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Create folder error:', e);
      Alert.alert('שגיאה', 'לא ניתן ליצור תיקיה');
    }

    setNewFolderName('');
    setShowNewFolderModal(false);
    setShowSubFolderModal(false);
    setParentFolderId(null);
  };

  const deleteFolder = async (folderId) => {
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        await folderService.deleteFolder(folderId);
      } else {
        const updated = folders.filter(f => f.id !== folderId && f.parentId !== folderId);
        await AsyncStorage.setItem('userFolders', JSON.stringify(updated));
      }
      setFolders(prev => prev.filter(f => f.id !== folderId && f.parentId !== folderId));
    } catch (e) {
      console.error('Delete folder error:', e);
    }
  };

  const handleCreateMessage = () => {
    navigation.navigate('CreateMessage', { user, token });
  };

  const handleOpenCamera = () => {
    navigation.navigate('VideoRecording', { user, token });
  };

  const getRootFolders = () => folders.filter(f => !f.parentId);
  const getSubFolders = (parentId) => folders.filter(f => f.parentId === parentId);

  if (!fontsLoaded) return null;

  // ======== RENDER SECTIONS ========

  const renderQuickActions = () => (
    <TouchableOpacity
      style={styles.createMessageBtn}
      onPress={handleCreateMessage}
      activeOpacity={0.88}
    >
      <LinearGradient
        colors={['#D4AF37', '#C5A059']}
        style={styles.createMessageGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.createMsgIconWrap}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.createMessageText}>צור מסר חדש</Text>
        <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.7)" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderDraftsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="document-text-outline" size={20} color="#D4AF37" />
          <Text style={styles.sectionTitle}>טיוטות</Text>
        </View>
        <Text style={styles.sectionCount}>{drafts.length}</Text>
      </View>

      {drafts.length === 0 ? (
        <View style={styles.emptySection}>
          <Ionicons name="document-outline" size={40} color="#E5DED3" />
          <Text style={styles.emptyText}>אין טיוטות</Text>
          <Text style={styles.emptySubtext}>מסרים שהתחלת ולא סיימת יופיעו כאן</Text>
        </View>
      ) : (
        drafts.map((draft, index) => (
          <TouchableOpacity key={draft.id || index} style={styles.messageCard}>
            <View style={[styles.messageAccent, { backgroundColor: '#D4AF37' }]} />
            <View style={styles.messageContent}>
              <Text style={styles.messageTitle}>{draft.title || 'טיוטה ללא שם'}</Text>
              <Text style={styles.messagePreview} numberOfLines={1}>
                {draft.content || 'אין תוכן'}
              </Text>
            </View>
            <Ionicons name="chevron-back" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderScheduledSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="time-outline" size={20} color="#7A8F74" />
          <Text style={styles.sectionTitle}>מסרים שתוזמנו</Text>
        </View>
        <Text style={styles.sectionCount}>{scheduledMessages.length}</Text>
      </View>

      {scheduledMessages.length === 0 ? (
        <View style={styles.emptySection}>
          <Ionicons name="calendar-outline" size={40} color="#E5DED3" />
          <Text style={styles.emptyText}>אין מסרים מתוזמנים</Text>
          <Text style={styles.emptySubtext}>מסרים שתוזמנו לשליחה יופיעו כאן</Text>
        </View>
      ) : (
        scheduledMessages.map((msg, index) => {
          const typeLabel = { video: 'סרטון', audio: 'הקלטה קולית', letter: 'מכתב', photo: 'תמונה' }[msg.type] || 'מסר';
          const firstRecipient = msg.recipients?.[0];
          const title = msg.title || (firstRecipient ? `${typeLabel} ל${firstRecipient.name}` : typeLabel);
          const dateStr = msg.scheduled_date || msg.scheduledDate;
          const displayDate = dateStr
            ? new Date(dateStr).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : null;
          return (
            <TouchableOpacity
              key={msg.id || index}
              style={styles.messageCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('MessageDetail', { message: msg })}
            >
              <View style={[styles.messageAccent, { backgroundColor: '#7A8F74' }]} />
              <View style={styles.messageContent}>
                <Text style={styles.messageTitle}>{title}</Text>
                <Text style={styles.messageDate}>
                  {displayDate ? `📅 ${displayDate}` : 'תאריך לא נקבע'}
                </Text>
              </View>
              <Ionicons name="chevron-back" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const renderFolderItem = (folder, depth = 0) => {
    const subFolders = getSubFolders(folder.id);
    // Include scheduled messages from AsyncStorage that belong to this folder
    const folderMsgs = scheduledMessages.filter(m => m.folder_id === folder.id || m.folderId === folder.id);
    const messages = [...(folder.messages || []), ...folderMsgs];
    const isExpanded = expandedFolders[folder.id];
    const hasContent = subFolders.length > 0 || messages.length > 0;

    return (
      <View key={folder.id} style={{ marginRight: depth * 16 }}>
        <TouchableOpacity
          style={[
            styles.folderCard,
            isExpanded && styles.folderCardExpanded,
          ]}
          onPress={() => hasContent && toggleFolder(folder.id)}
          onLongPress={() => {
            Alert.alert(folder.name, 'מה תרצה לעשות?', [
              { text: 'ביטול', style: 'cancel' },
              {
                text: 'הוסף תת-תיקיה',
                onPress: () => {
                  setParentFolderId(folder.id);
                  setShowSubFolderModal(true);
                },
              },
              {
                text: 'מחק תיקיה',
                style: 'destructive',
                onPress: () => {
                  Alert.alert('מחיקה', `למחוק את "${folder.name}"?`, [
                    { text: 'ביטול', style: 'cancel' },
                    { text: 'מחק', style: 'destructive', onPress: () => deleteFolder(folder.id) },
                  ]);
                },
              },
            ]);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.folderIcon, isExpanded && styles.folderIconExpanded]}>
            <Ionicons
              name={isExpanded ? 'folder-open' : 'folder'}
              size={22}
              color={isExpanded ? '#D4AF37' : '#7A8F74'}
            />
          </View>
          <View style={styles.folderInfo}>
            <Text style={[styles.folderName, isExpanded && styles.folderNameExpanded]}>
              {folder.name}
            </Text>
            <Text style={styles.folderCount}>
              {`${messages.length} מסרים`}
              {subFolders.length > 0 ? ` · ${subFolders.length} תת-תיקיות` : ''}
            </Text>
          </View>
          {hasContent ? (
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={isExpanded ? '#D4AF37' : '#9CA3AF'}
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                setParentFolderId(folder.id);
                setShowSubFolderModal(true);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="add" size={18} color="#C5A059" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Expanded content */}
        {isExpanded && (
          <View style={styles.folderContent}>
            {/* Sub-folders */}
            {subFolders.map(sub => renderFolderItem(sub, depth + 1))}

            {/* Messages inside folder */}
            {messages.length > 0 ? (
              messages.map((msg, idx) => {
                const typeLabel = { video: 'סרטון', audio: 'הקלטה קולית', letter: 'מכתב', photo: 'תמונה' }[msg.type] || 'מסר';
                const firstRecipient = msg.recipients?.[0];
                const title = msg.title || (firstRecipient ? `${typeLabel} ל${firstRecipient.name}` : typeLabel);
                const dateStr = msg.scheduled_date || msg.scheduledDate;
                const displayDate = dateStr
                  ? new Date(dateStr).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : null;
                return (
                  <TouchableOpacity
                    key={msg.id || idx}
                    style={styles.folderMessageCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      Alert.alert(
                        title,
                        [
                          displayDate ? `📅 תאריך שליחה: ${displayDate}` : null,
                          firstRecipient ? `👤 נמען: ${firstRecipient.name} · ${firstRecipient.phone}` : null,
                          `📋 סוג: ${typeLabel}`,
                        ].filter(Boolean).join('\n'),
                        [{ text: 'סגור' }]
                      );
                    }}
                  >
                    <View style={styles.folderMsgAccent} />
                    <Ionicons name="document-text-outline" size={18} color="#C5A059" style={{ marginLeft: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.folderMsgTitle}>{title}</Text>
                      {displayDate && (
                        <Text style={styles.folderMsgDate}>📅 {displayDate}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-back" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })
            ) : subFolders.length === 0 ? (
              <View style={styles.folderEmptyInner}>
                <Ionicons name="document-outline" size={28} color="#D8D2C2" />
                <Text style={styles.folderEmptyText}>התיקיה ריקה</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateMessage', { user, token, folderId: folder.id })}
                >
                  <Text style={styles.folderEmptyAction}>+ הוסף מסר לתיקיה</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  const renderFoldersSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="folder-outline" size={20} color="#7A8F74" />
          <Text style={styles.sectionTitle}>תיקיות</Text>
        </View>
        <TouchableOpacity
          style={styles.addFolderBtn}
          onPress={() => {
            setParentFolderId(null);
            setShowNewFolderModal(true);
          }}
        >
          <View style={styles.addFolderCircle}>
            <Ionicons name="add" size={20} color="#2D8B8B" />
          </View>
        </TouchableOpacity>
      </View>

      {getRootFolders().length === 0 ? (
        <View style={styles.emptySection}>
          <Ionicons name="folder-open-outline" size={40} color="#E5DED3" />
          <Text style={styles.emptyText}>אין תיקיות</Text>
          <Text style={styles.emptySubtext}>לחץ על + להוספת תיקיה חדשה</Text>
        </View>
      ) : (
        getRootFolders().map(folder => renderFolderItem(folder))
      )}
    </View>
  );

  // ======== BOTTOM BAR ========
  const renderBottomBar = () => (
    <BottomNavBar navigation={navigation} activeTab="home" user={user} token={token} phoneNumber={phoneNumber} />
  );

  // ======== MAIN RETURN ========
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfoRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || 'מ'}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>שלום</Text>
            <Text style={styles.userName}>
              {user?.firstName || 'אורח'} {user?.lastName || ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2D8B8B']}
            tintColor="#2D8B8B"
          />
        }
      >
        {renderQuickActions()}
        {renderDraftsSection()}
        {renderScheduledSection()}
        {renderFoldersSection()}
      </ScrollView>

      {renderBottomBar()}

      {/* New Folder Modal */}
      <Modal visible={showNewFolderModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>תיקיה חדשה</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="שם התיקיה"
              placeholderTextColor="#9CA3AF"
              value={newFolderName}
              onChangeText={setNewFolderName}
              textAlign="right"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setShowNewFolderModal(false); setNewFolderName(''); }}
              >
                <Text style={styles.modalCancelText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={createFolder}>
                <Text style={styles.modalConfirmText}>צור תיקיה</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sub-Folder Modal */}
      <Modal visible={showSubFolderModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>תת-תיקיה חדשה</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="שם תת-התיקיה"
              placeholderTextColor="#9CA3AF"
              value={newFolderName}
              onChangeText={setNewFolderName}
              textAlign="right"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setShowSubFolderModal(false); setNewFolderName(''); setParentFolderId(null); }}
              >
                <Text style={styles.modalCancelText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={createFolder}>
                <Text style={styles.modalConfirmText}>צור תת-תיקיה</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DED9CC',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D2C2',
  },
  userInfoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C5A059',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
  },
  welcomeText: {
    fontSize: 13,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  createMessageBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 7,
  },
  createMessageGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12,
  },
  createMsgIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createMessageText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    textAlign: 'right',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    marginRight: 8,
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: 'Rubik_500Medium',
    color: '#7A8A8A',
    backgroundColor: '#E5DED3',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#F7F5EF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8D2C2',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#7A8A8A',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Rubik_400Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  messageCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F7F5EF',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#3E4F46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8E2D4',
  },
  messageAccent: {
    width: 4,
    height: '100%',
  },
  messageContent: {
    flex: 1,
    padding: 14,
  },
  messageTitle: {
    fontSize: 15,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    textAlign: 'right',
    marginBottom: 3,
  },
  messagePreview: {
    fontSize: 13,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
  },
  messageDate: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8F74',
    textAlign: 'right',
  },
  addFolderBtn: {
    padding: 2,
  },
  addFolderCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F5EF',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Folder styles
  folderCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F7F5EF',
    borderRadius: 14,
    marginBottom: 8,
    padding: 14,
    shadowColor: '#3E4F46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8E2D4',
  },
  folderCardExpanded: {
    borderColor: '#D4AF37',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  folderIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EDE8DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderIconExpanded: {
    backgroundColor: '#F1E5AC',
  },
  folderInfo: {
    flex: 1,
    marginRight: 12,
  },
  folderName: {
    fontSize: 15,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    textAlign: 'right',
  },
  folderNameExpanded: {
    color: '#C5A059',
  },
  folderCount: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
    marginTop: 2,
  },

  // Folder expanded content
  folderContent: {
    backgroundColor: '#FDFCF8',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#D4AF37',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    paddingTop: 4,
    paddingBottom: 4,
  },
  folderMessageCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE0',
  },
  folderMsgAccent: {
    width: 3,
    height: 28,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    marginLeft: 10,
  },
  folderMsgTitle: {
    fontSize: 14,
    fontFamily: 'Rubik_500Medium',
    color: '#3E4F46',
    textAlign: 'right',
  },
  folderMsgDate: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 2,
  },
  folderEmptyInner: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  folderEmptyText: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 6,
  },
  folderEmptyAction: {
    fontSize: 14,
    fontFamily: 'Rubik_500Medium',
    color: '#D4AF37',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#F7F5EF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DED3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DED3',
    marginLeft: 8,
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'Rubik_700Bold',
    color: '#7A8A8A',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    marginRight: 8,
  },
  modalConfirmText: {
    fontSize: 15,
    fontFamily: 'Rubik_700Bold',
    color: '#FFFFFF',
  },
});

export default HomeScreen;