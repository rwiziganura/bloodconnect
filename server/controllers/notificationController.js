import pool from '../config/db.js';

export const getMyNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query(
      `SELECT n.*,
       br.blood_type, br.urgency, br.status AS request_status, br.quantity_units,
       h.hospital_name, h.city AS hospital_city,
       u2.name AS requester_name
       FROM notifications n
       LEFT JOIN blood_requests br ON n.request_id = br.id
       LEFT JOIN hospitals h ON br.hospital_id = h.id
       LEFT JOIN users u2 ON br.requester_id = u2.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('GET NOTIFICATIONS ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('MARK READ ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'All marked as read' });
  } catch (error) {
    console.error('MARK ALL READ ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ count: row.count });
  } catch (error) {
    console.error('UNREAD COUNT ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
