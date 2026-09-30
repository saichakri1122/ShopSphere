const pool = require("../../config/database");

// Get all addresses for a user
async function getAddressesByUserId(userId) {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        address_type,
        is_default,
        created_at,
        updated_at
      FROM addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `,
    [userId]
  );

  return result.rows;
}


// Get one address belonging to the user
async function getAddressById(userId, addressId) {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        address_type,
        is_default,
        created_at,
        updated_at
      FROM addresses
      WHERE id = $1
        AND user_id = $2
    `,
    [addressId, userId]
  );

  return result.rows[0] || null;
}


// Create a new address
async function createAddress(userId, addressData) {
  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    addressType,
    isDefault,
  } = addressData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // If this address is default,
    // remove default from existing addresses.
    if (isDefault) {
      await client.query(
        `
          UPDATE addresses
          SET
            is_default = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `,
        [userId]
      );
    }

    // First address automatically becomes default.
    const countResult = await client.query(
      `
        SELECT COUNT(*)::INTEGER AS count
        FROM addresses
        WHERE user_id = $1
      `,
      [userId]
    );

    const shouldBeDefault =
      countResult.rows[0].count === 0 || Boolean(isDefault);

    const result = await client.query(
      `
        INSERT INTO addresses (
          user_id,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          address_type,
          is_default
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11
        )
        RETURNING
          id,
          user_id,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          address_type,
          is_default,
          created_at,
          updated_at
      `,
      [
        userId,
        fullName.trim(),
        phone.trim(),
        addressLine1.trim(),
        addressLine2?.trim() || null,
        city.trim(),
        state.trim(),
        postalCode.trim(),
        country.trim(),
        addressType?.trim() || "home",
        shouldBeDefault,
      ]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}


// Update an address
async function updateAddress(userId, addressId, addressData) {
  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    addressType,
    isDefault,
  } = addressData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (isDefault) {
      await client.query(
        `
          UPDATE addresses
          SET
            is_default = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `,
        [userId]
      );
    }

    const result = await client.query(
      `
        UPDATE addresses
        SET
          full_name = $1,
          phone = $2,
          address_line1 = $3,
          address_line2 = $4,
          city = $5,
          state = $6,
          postal_code = $7,
          country = $8,
          address_type = $9,
          is_default = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
          AND user_id = $12
        RETURNING
          id,
          user_id,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          address_type,
          is_default,
          created_at,
          updated_at
      `,
      [
        fullName.trim(),
        phone.trim(),
        addressLine1.trim(),
        addressLine2?.trim() || null,
        city.trim(),
        state.trim(),
        postalCode.trim(),
        country.trim(),
        addressType?.trim() || "home",
        Boolean(isDefault),
        addressId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}


// Delete an address
async function deleteAddress(userId, addressId) {
  const result = await pool.query(
    `
      DELETE FROM addresses
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [addressId, userId]
  );

  return result.rows[0] || null;
}


// Set an address as default
async function setDefaultAddress(userId, addressId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const addressExists = await client.query(
      `
        SELECT id
        FROM addresses
        WHERE id = $1
          AND user_id = $2
      `,
      [addressId, userId]
    );

    if (addressExists.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        UPDATE addresses
        SET
          is_default = FALSE,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `,
      [userId]
    );

    const result = await client.query(
      `
        UPDATE addresses
        SET
          is_default = TRUE,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND user_id = $2
        RETURNING
          id,
          user_id,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          address_type,
          is_default,
          created_at,
          updated_at
      `,
      [addressId, userId]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}


module.exports = {
  getAddressesByUserId,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};