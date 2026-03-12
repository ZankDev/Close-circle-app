import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const toSafeDate = (d) => (d instanceof Date && !isNaN(d.getTime()) ? d : new Date());

const CalendarPicker = ({ visible, selectedDate, onDateSelect, onClose, minDate }) => {
  const safeDate = toSafeDate(selectedDate);
  const [currentMonth, setCurrentMonth] = useState(safeDate.getMonth());
  const [currentYear, setCurrentYear] = useState(safeDate.getFullYear());
  const [selectedTime, setSelectedTime] = useState({
    hours: safeDate.getHours(),
    minutes: safeDate.getMinutes() >= 30 ? 30 : 0,
  });

  const callOnDateSelect = (date) => {
    if (typeof onDateSelect === 'function') onDateSelect(date);
    if (typeof onClose === 'function') onClose();
  };

  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleYearChange = (increment) => {
    setCurrentYear(currentYear + increment);
  };

  const handleDaySelect = (day) => {
    if (!day) return;

    const newDate = new Date(currentYear, currentMonth, day, selectedTime.hours, selectedTime.minutes);
    
    // Check if date is before minDate
    if (minDate && newDate < minDate) {
      return;
    }

    const finalDate = new Date(currentYear, currentMonth, day, selectedTime.hours, selectedTime.minutes);
    callOnDateSelect(finalDate);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    const d = toSafeDate(selectedDate);
    return day === d.getDate() &&
           currentMonth === d.getMonth() &&
           currentYear === d.getFullYear();
  };

  const isPastDate = (day) => {
    if (!day) return false;
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const calendarDays = generateCalendarDays();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View animation="zoomIn" duration={300} style={styles.calendarContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#FAF7F2', '#FFFFFF']}
            style={styles.calendarContent}
          >
            {/* Header with Year Selection */}
            <View style={styles.yearSelector}>
              <TouchableOpacity onPress={() => handleYearChange(-1)} style={styles.yearButton}>
                <Ionicons name="chevron-forward" size={20} color="#2D8B8B" />
              </TouchableOpacity>
              <Text style={styles.yearText}>{currentYear}</Text>
              <TouchableOpacity onPress={() => handleYearChange(1)} style={styles.yearButton}>
                <Ionicons name="chevron-back" size={20} color="#2D8B8B" />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                <Ionicons name="chevron-back" size={24} color="#2D8B8B" />
              </TouchableOpacity>
              
              <LinearGradient
                colors={['#2D8B8B', '#1F6D6D']}
                style={styles.monthBadge}
              >
                <Text style={styles.monthText}>{months[currentMonth]}</Text>
              </LinearGradient>

              <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={24} color="#2D8B8B" />
              </TouchableOpacity>
            </View>

            {/* Days of Week */}
            <View style={styles.daysHeader}>
              {daysOfWeek.map((day, index) => (
                <View key={index} style={styles.dayHeaderCell}>
                  <Text style={styles.dayHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                const isPast = isPastDate(day);
                const isCurrentDay = isToday(day);
                const isDaySelected = isSelected(day);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      !day && styles.emptyCell,
                      isPast && styles.pastDay,
                    ]}
                    onPress={() => handleDaySelect(day)}
                    disabled={!day || isPast}
                    activeOpacity={0.7}
                  >
                    {day && (
                      <View style={styles.dayCellContent}>
                        {isDaySelected ? (
                          <LinearGradient
                            colors={['#10B981', '#34D399']}
                            style={styles.selectedDay}
                          >
                            <Text style={styles.selectedDayText}>{day}</Text>
                          </LinearGradient>
                        ) : isCurrentDay ? (
                          <View style={styles.todayDay}>
                            <Text style={styles.todayDayText}>{day}</Text>
                          </View>
                        ) : (
                          <Text style={[
                            styles.dayText,
                            isPast && styles.pastDayText
                          ]}>
                            {day}
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Picker */}
            <View style={styles.timeSection}>
              <View style={styles.timeSectionHeader}>
                <Ionicons name="time-outline" size={20} color="#2D8B8B" />
                <Text style={styles.timeSectionTitle}>בחר שעה</Text>
              </View>
              
              <View style={styles.timePicker}>
                {/* Hours */}
                <View style={styles.timeColumn}>
                  <TouchableOpacity 
                    style={styles.timeArrow}
                    onPress={() => setSelectedTime({
                      ...selectedTime,
                      hours: selectedTime.hours === 23 ? 0 : selectedTime.hours + 1
                    })}
                  >
                    <Ionicons name="chevron-up" size={20} color="#2D8B8B" />
                  </TouchableOpacity>
                  
                  <View style={styles.timeDisplay}>
                    <Text style={styles.timeValue}>
                      {String(selectedTime.hours).padStart(2, '0')}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.timeArrow}
                    onPress={() => setSelectedTime({
                      ...selectedTime,
                      hours: selectedTime.hours === 0 ? 23 : selectedTime.hours - 1
                    })}
                  >
                    <Ionicons name="chevron-down" size={20} color="#2D8B8B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                {/* Minutes */}
                <View style={styles.timeColumn}>
                  <TouchableOpacity 
                    style={styles.timeArrow}
                    onPress={() => setSelectedTime({
                      ...selectedTime,
                      minutes: selectedTime.minutes === 30 ? 0 : 30
                    })}
                  >
                    <Ionicons name="chevron-up" size={20} color="#2D8B8B" />
                  </TouchableOpacity>
                  
                  <View style={styles.timeDisplay}>
                    <Text style={styles.timeValue}>
                      {String(selectedTime.minutes).padStart(2, '0')}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.timeArrow}
                    onPress={() => setSelectedTime({
                      ...selectedTime,
                      minutes: selectedTime.minutes === 30 ? 0 : 30
                    })}
                  >
                    <Ionicons name="chevron-down" size={20} color="#2D8B8B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  const d = toSafeDate(selectedDate);
                  const finalDate = new Date(
                    currentYear,
                    currentMonth,
                    d.getDate(),
                    selectedTime.hours,
                    selectedTime.minutes
                  );
                  callOnDateSelect(finalDate);
                }}
              >
                <LinearGradient
                  colors={['#10B981', '#34D399']}
                  style={styles.confirmGradient}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.confirmButtonText}>אישור</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  calendarContent: {
    padding: 20,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 30,
  },
  yearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E5DED3',
  },
  yearText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5B5B',
    minWidth: 80,
    textAlign: 'center',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#E5DED3',
  },
  monthBadge: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D8B8B',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  dayCellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: '#2D5B5B',
    textAlign: 'center',
  },
  selectedDay: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  todayDay: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2D8B8B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayDayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D8B8B',
  },
  pastDay: {
    opacity: 0.3,
  },
  pastDayText: {
    color: '#666666',
  },
  timeSection: {
    backgroundColor: '#E5DED3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5B5B',
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  timeColumn: {
    alignItems: 'center',
    gap: 8,
  },
  timeArrow: {
    padding: 8,
  },
  timeDisplay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5B5B',
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D8B8B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#E5DED3',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A8A8A',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default CalendarPicker;
