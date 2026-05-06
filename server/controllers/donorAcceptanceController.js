import pool from '../config/db.js';

// Submit donor acceptance form
export const submitDonorAcceptance = async (req, res) => {
  try {
    const {
      request_id,
      full_name,
      phone,
      email,
      age,
      weight,
      blood_type,
      last_donation_date,
      medical_conditions
    } = req.body;

    // Validation
    if (!request_id || !full_name || !phone || !email || !age || !weight || !blood_type) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Age validation
    if (age < 18 || age > 65) {
      return res.status(400).json({ error: 'You are not eligible to donate. Age must be between 18 and 65.' });
    }

    // Weight validation
    if (weight < 50) {
      return res.status(400).json({ error: 'Minimum weight is 50kg' });
    }

    // Get donor_id if user is authenticated
    let donor_id = null;
    if (req.user && req.user.role === 'donor') {
      const [donorRows] = await pool.query(
        'SELECT id FROM donors WHERE user_id = ?',
        [req.user.id]
      );
      if (donorRows.length > 0) {
        donor_id = donorRows[0].id;
      }
    }

    // Check if request exists and is open
    const [requestRows] = await pool.query(
      'SELECT br.*, h.hospital_name, h.user_id as hospital_user_id FROM blood_requests br JOIN hospitals h ON br.hospital_id = h.id WHERE br.id = ? AND br.status = "open"',
      [request_id]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({ error: 'Blood request not found or no longer open' });
    }

    const request = requestRows[0];

    // Insert donor acceptance
    const [result] = await pool.query(
      `INSERT INTO donor_acceptances 
       (request_id, donor_id, full_name, phone, email, age, weight, blood_type, last_donation_date, medical_conditions, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [request_id, donor_id, full_name, phone, email, age, weight, blood_type, last_donation_date || null, medical_conditions || null]
    );

    // Create notification for hospital
    await pool.query(
      `INSERT INTO notifications (user_id, message, type, status) 
       VALUES (?, ?, 'donor_acceptance', 'unread')`,
      [
        request.hospital_user_id,
        `New donor ${full_name} has accepted your ${blood_type} blood request`
      ]
    );

    res.status(201).json({
      message: 'Your donation acceptance has been submitted successfully',
      acceptance_id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting donor acceptance:', error);
    res.status(500).json({ error: 'Failed to submit donor acceptance' });
  }
};

// Get all donor acceptances for a hospital
export const getHospitalDonorAcceptances = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get hospital_id
    const [hospitalRows] = await pool.query(
      'SELECT id FROM hospitals WHERE user_id = ?',
      [userId]
    );

    if (hospitalRows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const hospital_id = hospitalRows[0].id;

    // Get all donor acceptances for this hospital's requests
    const [acceptances] = await pool.query(
      `SELECT 
        da.*,
        br.blood_type as request_blood_type,
        br.urgency,
        br.quantity_units,
        br.created_at as request_created_at
      FROM donor_acceptances da
      JOIN blood_requests br ON da.request_id = br.id
      WHERE br.hospital_id = ?
      ORDER BY da.created_at DESC`,
      [hospital_id]
    );

    res.json({ acceptances });
  } catch (error) {
    console.error('Error fetching donor acceptances:', error);
    res.status(500).json({ error: 'Failed to fetch donor acceptances' });
  }
};

// Get donor acceptances for a specific request
export const getRequestDonorAcceptances = async (req, res) => {
  try {
    const { request_id } = req.params;
    const userId = req.user.id;

    // Verify hospital owns this request
    const [requestRows] = await pool.query(
      `SELECT br.* FROM blood_requests br
       JOIN hospitals h ON br.hospital_id = h.id
       WHERE br.id = ? AND h.user_id = ?`,
      [request_id, userId]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({ error: 'Request not found or unauthorized' });
    }

    // Get acceptances for this request
    const [acceptances] = await pool.query(
      `SELECT * FROM donor_acceptances 
       WHERE request_id = ?
       ORDER BY created_at DESC`,
      [request_id]
    );

    res.json({ acceptances });
  } catch (error) {
    console.error('Error fetching request acceptances:', error);
    res.status(500).json({ error: 'Failed to fetch acceptances' });
  }
};

// Approve donor acceptance
export const approveDonorAcceptance = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_location, appointment_date, appointment_time } = req.body;
    const userId = req.user.id;

    if (!appointment_location || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Appointment details are required' });
    }

    // Get acceptance and verify hospital owns it
    const [acceptanceRows] = await pool.query(
      `SELECT da.*, br.hospital_id, h.hospital_name, h.user_id as hospital_user_id
       FROM donor_acceptances da
       JOIN blood_requests br ON da.request_id = br.id
       JOIN hospitals h ON br.hospital_id = h.id
       WHERE da.id = ? AND h.user_id = ?`,
      [id, userId]
    );

    if (acceptanceRows.length === 0) {
      return res.status(404).json({ error: 'Acceptance not found or unauthorized' });
    }

    const acceptance = acceptanceRows[0];

    // Update acceptance status
    await pool.query(
      `UPDATE donor_acceptances 
       SET status = 'approved', 
           appointment_location = ?,
           appointment_date = ?,
           appointment_time = ?
       WHERE id = ?`,
      [appointment_location, appointment_date, appointment_time, id]
    );

    // Create notification for donor (if they have an account)
    if (acceptance.donor_id) {
      const [donorUserRows] = await pool.query(
        'SELECT user_id FROM donors WHERE id = ?',
        [acceptance.donor_id]
      );

      if (donorUserRows.length > 0) {
        const formattedDate = new Date(appointment_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        await pool.query(
          `INSERT INTO notifications (user_id, message, type, status) 
           VALUES (?, ?, 'approval', 'unread')`,
          [
            donorUserRows[0].user_id,
            `You are approved! Please go to ${acceptance.hospital_name} at ${appointment_location} on ${formattedDate} at ${appointment_time}`
          ]
        );
      }
    }

    res.json({ 
      message: 'Donor approved successfully',
      acceptance: {
        id,
        status: 'approved',
        appointment_location,
        appointment_date,
        appointment_time
      }
    });
  } catch (error) {
    console.error('Error approving donor:', error);
    res.status(500).json({ error: 'Failed to approve donor' });
  }
};

// Reject donor acceptance
export const rejectDonorAcceptance = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const userId = req.user.id;

    // Get acceptance and verify hospital owns it
    const [acceptanceRows] = await pool.query(
      `SELECT da.*, h.user_id as hospital_user_id
       FROM donor_acceptances da
       JOIN blood_requests br ON da.request_id = br.id
       JOIN hospitals h ON br.hospital_id = h.id
       WHERE da.id = ? AND h.user_id = ?`,
      [id, userId]
    );

    if (acceptanceRows.length === 0) {
      return res.status(404).json({ error: 'Acceptance not found or unauthorized' });
    }

    const acceptance = acceptanceRows[0];

    // Update acceptance status
    await pool.query(
      `UPDATE donor_acceptances 
       SET status = 'rejected', rejection_reason = ?
       WHERE id = ?`,
      [rejection_reason || 'Not eligible at this time', id]
    );

    // Create notification for donor (if they have an account)
    if (acceptance.donor_id) {
      const [donorUserRows] = await pool.query(
        'SELECT user_id FROM donors WHERE id = ?',
        [acceptance.donor_id]
      );

      if (donorUserRows.length > 0) {
        await pool.query(
          `INSERT INTO notifications (user_id, message, type, status) 
           VALUES (?, ?, 'rejection', 'unread')`,
          [
            donorUserRows[0].user_id,
            `Your donation application was not approved. Reason: ${rejection_reason || 'Not eligible at this time'}`
          ]
        );
      }
    }

    res.json({ 
      message: 'Donor rejected',
      acceptance: {
        id,
        status: 'rejected',
        rejection_reason
      }
    });
  } catch (error) {
    console.error('Error rejecting donor:', error);
    res.status(500).json({ error: 'Failed to reject donor' });
  }
};

// Get donor's own acceptances
export const getDonorOwnAcceptances = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get donor_id
    const [donorRows] = await pool.query(
      'SELECT id FROM donors WHERE user_id = ?',
      [userId]
    );

    if (donorRows.length === 0) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    const donor_id = donorRows[0].id;

    // Get acceptances
    const [acceptances] = await pool.query(
      `SELECT 
        da.*,
        br.blood_type as request_blood_type,
        br.urgency,
        h.hospital_name,
        h.address as hospital_address,
        h.city as hospital_city
      FROM donor_acceptances da
      JOIN blood_requests br ON da.request_id = br.id
      JOIN hospitals h ON br.hospital_id = h.id
      WHERE da.donor_id = ?
      ORDER BY da.created_at DESC`,
      [donor_id]
    );

    res.json({ acceptances });
  } catch (error) {
    console.error('Error fetching donor acceptances:', error);
    res.status(500).json({ error: 'Failed to fetch acceptances' });
  }
};
