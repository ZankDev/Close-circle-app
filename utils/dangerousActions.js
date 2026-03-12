import { Alert } from 'react-native';

/**
 * iPhone-style dangerous action alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {function} onConfirm - Function to execute on confirmation
 * @param {string} confirmText - Text for confirm button (default: 'אישור')
 * @param {string} cancelText - Text for cancel button (default: 'ביטול')
 */
export const showDangerousActionAlert = (
  title,
  message,
  onConfirm,
  confirmText = 'אישור',
  cancelText = 'ביטול'
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        style: 'cancel',
      },
      {
        text: confirmText,
        style: 'destructive', // This makes it red on iOS
        onPress: onConfirm,
      },
    ],
    {
      cancelable: true,
      userInterfaceStyle: 'light',
    }
  );
};

/**
 * Payment confirmation alert
 */
export const showPaymentConfirmation = (amount, planName, onConfirm) => {
  showDangerousActionAlert(
    'אישור תשלום',
    `האם אתה בטוח שברצונך לשדרג ל${planName} תמורת ${amount}?`,
    onConfirm,
    'שלם עכשיו',
    'ביטול'
  );
};

/**
 * Message sending confirmation
 */
export const showSendMessageConfirmation = (recipient, onConfirm) => {
  showDangerousActionAlert(
    'שליחת הודעה',
    `האם אתה בטוח שברצונך לשלוח את ההודעה ל${recipient}? לא ניתן יהיה לבטל את הפעולה.`,
    onConfirm,
    'שלח הודעה',
    'ביטול'
  );
};

/**
 * Delete confirmation alert
 */
export const showDeleteConfirmation = (itemName, onConfirm) => {
  showDangerousActionAlert(
    'מחיקה',
    `האם אתה בטוח שברצונך למחוק את "${itemName}"? פעולה זו לא ניתנת לביטול.`,
    onConfirm,
    'מחק',
    'ביטול'
  );
};

/**
 * Subscription cancellation alert
 */
export const showCancelSubscriptionConfirmation = (onConfirm) => {
  showDangerousActionAlert(
    'ביטול מנוי',
    'האם אתה בטוח שברצונך לבטל את המנוי? תאבד גישה לכל התכונות בסוף תקופת החיוב הנוכחית.',
    onConfirm,
    'בטל מנוי',
    'השאר מנוי'
  );
};

/**
 * Account deletion alert
 */
export const showDeleteAccountConfirmation = (onConfirm) => {
  showDangerousActionAlert(
    'מחיקת חשבון',
    'האם אתה בטוח שברצונך למחוק את החשבון? כל הנתונים יימחקו לצמיתות ולא ניתן יהיה לשחזר אותם.',
    onConfirm,
    'מחק חשבון',
    'ביטול'
  );
};

/**
 * Important action confirmation (generic)
 */
export const showImportantActionConfirmation = (title, message, onConfirm) => {
  showDangerousActionAlert(
    title,
    message,
    onConfirm,
    'המשך',
    'ביטול'
  );
};