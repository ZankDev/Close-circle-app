import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let handlerConfigured = false;

const configureNotificationHandler = () => {
  if (handlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('message-updates', {
      name: 'Message Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    }).catch((error) => console.log('Notification channel error:', error));
  }

  handlerConfigured = true;
};

export const initializeNotifications = () => {
  configureNotificationHandler();
};

export const requestNotificationPermissions = async () => {
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted || settings.status === 'granted') {
      return true;
    }

    const requestResult = await Notifications.requestPermissionsAsync();
    return requestResult.granted || requestResult.status === 'granted';
  } catch (error) {
    console.log('Notification permission error:', error);
    return false;
  }
};

const formatDateLabel = (dateInput) => {
  if (!dateInput) {
    return '';
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const sendMessageScheduledNotification = async ({
  recipientName = 'הנמען',
  scheduledDate,
}) => {
  try {
    const currentPermissions = await Notifications.getPermissionsAsync();
    if (!currentPermissions.granted) {
      return false;
    }

    initializeNotifications();

    const dateLabel = formatDateLabel(scheduledDate);
    const bodySuffix = dateLabel ? ` וישלח בתאריך ${dateLabel}` : '';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'המסר שלך מוכן',
        body: `המסר שלך ל${recipientName} תוזמן בהצלחה${bodySuffix}`,
        data: {
          recipientName,
          scheduledDate,
        },
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.log('Notification scheduling error:', error);
    return false;
  }
};
