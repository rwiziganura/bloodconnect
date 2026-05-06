import pool from '../config/db.js';

export const getMyNotifications = async (req, res) => {
  let connection;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    connection = await pool.getConnection();

    const [notifications] = await connection.query(
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

    // Count unread notifications using correct column name
    const unreadCount = notifications.filter(n => n.status === 'unread').length;
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('❌ GET NOTIFICATIONS ERROR:', error.message);
    console.error('  Code:', error.code);
    console.error('  Stack:', error.stack);
    res.status(500).json({ 
      error: 'Could not load notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const markAsRead = async (req, res) => {
  let connection;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Notification ID required' });
    }

    connection = await pool.getConnection();

    // Use correct column name: status instead of is_read
    await connection.query(
      'UPDATE notifications SET status = ? WHERE id = ? AND user_id = ?',
      ['read', id, req.user.id]
    );

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('❌ MARK READ ERROR:', error.message);
    console.error('  Code:', error.code);
    res.status(500).json({ 
      error: 'Could not mark as read',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const markAllAsRead = async (req, res) => {
  let connection;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    connection = await pool.getConnection();

    // Use correct column name: status instead of is_read
    await connection.query(
      'UPDATE notifications SET status = ? WHERE user_id = ?',
      ['read', req.user.id]
    );

    res.json({ message: 'All marked as read' });
  } catch (error) {
    console.error('❌ MARK ALL READ ERROR:', error.message);
    console.error('  Code:', error.code);
    res.status(500).json({ 
      error: 'Could not mark all as read',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const getUnreadCount = async (req, res) => {
  let connection;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    connection = await pool.getConnection();

    // Use correct column name: status = 'unread' instead of is_read = FALSE
    const [[row]] = await connection.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND status = ?',
      [req.user.id, 'unread']
    );

    res.json({ unreadCount: row?.count || 0 });
  } catch (error) {
    console.error('❌ UNREAD COUNT ERROR:', error.message);
    console.error('  Code:', error.code);
    res.status(500).json({ 
      error: 'Could not get unread count',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
