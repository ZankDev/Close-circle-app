/**
 * databaseService.js
 * All database + storage operations via Supabase.
 * Replaces the old Railway API fetch layer.
 */
import { supabase } from '../utils/supabase';

// ─────────────────────────────────────────────────────────────
// Auth Service
// ─────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Send a phone OTP via Supabase Auth.
   * Supabase handles SMS delivery through the configured provider (Twilio, etc.)
   */
  async sendPhoneOTP(phoneNumber) {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    if (error) throw error;
    return { success: true };
  },

  /**
   * Verify the OTP code entered by the user.
   * Returns the Supabase session + user on success.
   */
  async verifyOTP(phoneNumber, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  },

  /**
   * Get the current authenticated user from the active session.
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Sign out the current user.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },
};


// ─────────────────────────────────────────────────────────────
// User / Profile Service
// ─────────────────────────────────────────────────────────────
export const userService = {
  /**
   * Fetch the profile row for the currently signed-in user.
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return { success: true, user: data };
  },

  /**
   * Create or update the user's profile.
   * Called after OTP verification on first registration.
   */
  async upsertProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...profileData }, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return { success: true, user: data };
  },
};


// ─────────────────────────────────────────────────────────────
// Package / Subscription Service
// ─────────────────────────────────────────────────────────────
export const subscriptionService = {
  /**
   * Fetch the static packages catalog.
   */
  async getPackages() {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('price', { ascending: true });
    if (error) throw error;
    return { success: true, packages: data };
  },

  /**
   * Fetch the active purchased packages for the current user.
   */
  async getUserPackages(userId) {
    const { data, error } = await supabase
      .from('user_packages')
      .select('*, packages(*)')
      .eq('user_id', userId)
      .eq('status', 'active');
    if (error) throw error;
    return { success: true, packages: data };
  },

  /**
   * Record a new package purchase.
   * Called after successful payment.
   */
  async purchasePackage(userId, packageId, messagesLimit, paymentRef = null) {
    const { data, error } = await supabase
      .from('user_packages')
      .insert({
        user_id: userId,
        package_id: packageId,
        messages_limit: messagesLimit,
        messages_used: 0,
        status: 'active',
        payment_ref: paymentRef,
      })
      .select('*, packages(*)')
      .single();
    if (error) throw error;
    return { success: true, userPackage: data };
  },

  /**
   * Cancel a package (only allowed if no scheduled/sent messages exist).
   */
  async cancelPackage(userPackageId) {
    const { error } = await supabase
      .from('user_packages')
      .update({ status: 'cancelled' })
      .eq('id', userPackageId);
    if (error) throw error;
    return { success: true };
  },
};


// ─────────────────────────────────────────────────────────────
// Message Service
// ─────────────────────────────────────────────────────────────
export const messageService = {
  /**
   * Fetch all messages for the current user.
   * Includes related recipients and attachments.
   */
  async getUserMessages(userId, options = {}) {
    let query = supabase
      .from('messages')
      .select('*, recipients(*), message_attachments(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.status) query = query.eq('status', options.status);
    if (options.folderId) query = query.eq('folder_id', options.folderId);

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, messages: data };
  },

  /**
   * Fetch a single message by ID.
   */
  async getMessage(messageId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, recipients(*), message_attachments(*)')
      .eq('id', messageId)
      .single();
    if (error) throw error;
    return { success: true, message: data };
  },

  /**
   * Create a new message draft.
   */
  async createMessage(userId, messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ user_id: userId, status: 'draft', ...messageData })
      .select()
      .single();
    if (error) throw error;
    return { success: true, message: data };
  },

  /**
   * Update an existing message (e.g. schedule it, change content).
   */
  async updateMessage(messageId, updateData) {
    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, message: data };
  },

  /**
   * Delete a message and all related rows (cascade handles recipients/attachments).
   */
  async deleteMessage(messageId) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    if (error) throw error;
    return { success: true };
  },

  /**
   * Schedule a message by setting its date and status.
   */
  async scheduleMessage(messageId, scheduledDate) {
    return messageService.updateMessage(messageId, {
      scheduled_date: scheduledDate,
      status: 'scheduled',
    });
  },

  /**
   * Move a message to a folder (or out of a folder with null).
   */
  async moveMessage(messageId, folderId) {
    return messageService.updateMessage(messageId, { folder_id: folderId });
  },

  /**
   * Add a recipient to a message.
   */
  async addRecipient(messageId, recipientData) {
    const { data, error } = await supabase
      .from('recipients')
      .insert({ message_id: messageId, ...recipientData })
      .select()
      .single();
    if (error) throw error;
    return { success: true, recipient: data };
  },

  /**
   * Add multiple recipients to a message in one call.
   */
  async addRecipients(messageId, recipients) {
    const rows = recipients.map(r => ({ message_id: messageId, ...r }));
    const { data, error } = await supabase
      .from('recipients')
      .insert(rows)
      .select();
    if (error) throw error;
    return { success: true, recipients: data };
  },
};


// ─────────────────────────────────────────────────────────────
// Folder Service
// ─────────────────────────────────────────────────────────────
export const folderService = {
  async getUserFolders(userId) {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { success: true, folders: data };
  },

  async createFolder(userId, name, parentFolderId = null) {
    const { data, error } = await supabase
      .from('folders')
      .insert({ user_id: userId, name, parent_folder_id: parentFolderId })
      .select()
      .single();
    if (error) throw error;
    return { success: true, folder: data };
  },

  async updateFolder(folderId, name) {
    const { data, error } = await supabase
      .from('folders')
      .update({ name })
      .eq('id', folderId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, folder: data };
  },

  async deleteFolder(folderId) {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);
    if (error) throw error;
    return { success: true };
  },
};


// ─────────────────────────────────────────────────────────────
// Flower Order Service
// ─────────────────────────────────────────────────────────────
export const flowerOrderService = {
  async createOrder(userId, orderData) {
    const { data, error } = await supabase
      .from('flower_orders')
      .insert({ user_id: userId, ...orderData })
      .select()
      .single();
    if (error) throw error;
    return { success: true, order: data };
  },

  async getUserOrders(userId) {
    const { data, error } = await supabase
      .from('flower_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, orders: data };
  },

  async cancelOrder(orderId) {
    const { error } = await supabase
      .from('flower_orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);
    if (error) throw error;
    return { success: true };
  },
};


// ─────────────────────────────────────────────────────────────
// File Upload Service (Supabase Storage)
// ─────────────────────────────────────────────────────────────
export const fileUploadService = {
  /**
   * Upload a media file to Supabase Storage.
   * @param {string} userId - current user's ID (used for path namespacing)
   * @param {string} type - 'VIDEO' | 'AUDIO' | 'PHOTO'
   * @param {object} file - { uri, name, mimeType }
   * @returns {{ fileUrl, filePath }}
   */
  async uploadMedia(userId, type, file) {
    const folder = type === 'VIDEO' ? 'videos' : type === 'AUDIO' ? 'audio' : 'photos';
    const ext = file.name.split('.').pop();
    const filename = `${folder}/${userId}/${Date.now()}.${ext}`;

    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filename, blob, {
        contentType: file.mimeType || 'application/octet-stream',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(data.path);

    return { filePath: data.path, fileUrl: urlData.publicUrl };
  },

  /**
   * Save attachment metadata to the message_attachments table.
   */
  async saveAttachment(messageId, type, filePath, fileUrl) {
    const { data, error } = await supabase
      .from('message_attachments')
      .insert({ message_id: messageId, type, file_path: filePath, file_url: fileUrl })
      .select()
      .single();
    if (error) throw error;
    return { success: true, attachment: data };
  },

  /**
   * Upload and immediately link to a message.
   */
  async uploadAndAttach(userId, messageId, type, file) {
    const { filePath, fileUrl } = await fileUploadService.uploadMedia(userId, type, file);
    return fileUploadService.saveAttachment(messageId, type, filePath, fileUrl);
  },
};
