const locationCompanyService = require('../services/locationCompanyService');
const { queryCommon } = require('../config/db');

/**
 * 1. Search IT companies by city, state, postal code, or coordinates with multi-criteria filters
 */
async function searchLocationCompanies(req, res, next) {
  try {
    const {
      city,
      state,
      country,
      postal_code,
      q,
      lat,
      lng,
      radius_km,
      company_type,
      domain,
      job_role,
      experience_level,
      work_mode,
      is_hiring,
      sort,
      page,
      limit,
    } = req.query;

    const results = await locationCompanyService.searchCompaniesByLocation({
      city,
      state,
      country,
      postal_code,
      q,
      lat,
      lng,
      radius_km,
      company_type,
      domain,
      job_role,
      experience_level,
      work_mode,
      is_hiring,
      sort,
      page,
      limit,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Get full company profile with all verified offices, tech stack, and career opportunities
 */
async function getCompanyDetails(req, res, next) {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;

    const company = await locationCompanyService.getCompanyDetails(id, lat, lng);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with identifier '${id}' was not found in the verified directory.`,
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Get distinct location metadata for filter dropdowns and popular tech hubs
 */
async function getLocationMetadata(req, res, next) {
  try {
    const meta = await locationCompanyService.getLocationMetadata();
    res.json({
      success: true,
      data: meta,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Admin: Add a new office location for a company
 */
async function adminAddOffice(req, res, next) {
  try {
    const { company_id } = req.params;
    const {
      office_name,
      office_type = 'DEVELOPMENT_CENTER',
      address_line1,
      address_line2,
      city,
      state,
      country = 'India',
      postal_code,
      latitude,
      longitude,
      phone,
      email,
      is_hiring_here = 1,
      work_modes = 'HYBRID',
      is_verified = 1,
    } = req.body;

    if (!office_name || !address_line1 || !city || !state || !postal_code) {
      return res.status(400).json({
        success: false,
        message: 'Office name, address line 1, city, state, and postal code are required.',
      });
    }

    const [compRows] = await queryCommon('SELECT id FROM companies WHERE id = ?', [company_id]);
    if (compRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const [result] = await queryCommon(`
      INSERT INTO company_offices 
      (company_id, office_name, office_type, address_line1, address_line2, city, state, country, postal_code, latitude, longitude, phone, email, is_hiring_here, work_modes, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      company_id, office_name.trim(), office_type, address_line1.trim(),
      address_line2 ? address_line2.trim() : null, city.trim(), state.trim(),
      country.trim(), postal_code.trim(), latitude || null, longitude || null,
      phone ? phone.trim() : null, email ? email.trim() : null,
      is_hiring_here ? 1 : 0, work_modes, is_verified ? 1 : 0
    ]);

    const [newOffice] = await queryCommon('SELECT * FROM company_offices WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Office location successfully added and verified.',
      data: newOffice[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Admin: Update company metadata & tech domains
 */
async function adminUpdateCompany(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      industry,
      company_type,
      website,
      careers_url,
      headquarters,
      tier,
      rating,
      overview,
      employee_count_range,
      is_verified,
      tech_domains,
    } = req.body;

    const [compRows] = await queryCommon('SELECT id FROM companies WHERE id = ?', [id]);
    if (compRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    await queryCommon(`
      UPDATE companies 
      SET name = COALESCE(?, name),
          industry = COALESCE(?, industry),
          company_type = COALESCE(?, company_type),
          website = COALESCE(?, website),
          careers_url = COALESCE(?, careers_url),
          headquarters = COALESCE(?, headquarters),
          tier = COALESCE(?, tier),
          rating = COALESCE(?, rating),
          overview = COALESCE(?, overview),
          employee_count_range = COALESCE(?, employee_count_range),
          is_verified = COALESCE(?, is_verified)
      WHERE id = ?
    `, [
      name ? name.trim() : null,
      industry ? industry.trim() : null,
      company_type || null,
      website || null,
      careers_url || null,
      headquarters || null,
      tier || null,
      rating || null,
      overview || null,
      employee_count_range || null,
      is_verified !== undefined ? (is_verified ? 1 : 0) : null,
      id
    ]);

    // Update domains if provided
    if (Array.isArray(tech_domains)) {
      await queryCommon('DELETE FROM company_tech_domains WHERE company_id = ?', [id]);
      for (const td of tech_domains) {
        if (td.domain_name) {
          await queryCommon(`
            INSERT INTO company_tech_domains (company_id, domain_id, domain_name, tech_stack, is_verified)
            VALUES (?, ?, ?, ?, 1)
          `, [
            id,
            td.domain_id || null,
            td.domain_name.trim(),
            JSON.stringify(Array.isArray(td.tech_stack) ? td.tech_stack : [td.tech_stack]),
          ]);
        }
      }
    }

    const updated = await locationCompanyService.getCompanyDetails(id);
    res.json({
      success: true,
      message: 'Company details and verified tech domains updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. Admin: Toggle company or office verification / hiring status
 */
async function adminToggleStatus(req, res, next) {
  try {
    const { target, id } = req.params; // target: 'company' | 'office'

    if (target === 'company') {
      const [rows] = await queryCommon('SELECT id, is_verified, status FROM companies WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Company not found.' });

      const newVerified = rows[0].is_verified ? 0 : 1;
      await queryCommon('UPDATE companies SET is_verified = ? WHERE id = ?', [newVerified, id]);
      return res.json({ success: true, is_verified: newVerified });
    }

    if (target === 'office') {
      const [rows] = await queryCommon('SELECT id, is_hiring_here, is_verified FROM company_offices WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Office not found.' });

      const { field } = req.body; // 'hiring' or 'verify'
      if (field === 'hiring') {
        const newHiring = rows[0].is_hiring_here ? 0 : 1;
        await queryCommon('UPDATE company_offices SET is_hiring_here = ? WHERE id = ?', [newHiring, id]);
        return res.json({ success: true, is_hiring_here: newHiring });
      }

      const newVerified = rows[0].is_verified ? 0 : 1;
      await queryCommon('UPDATE company_offices SET is_verified = ? WHERE id = ?', [newVerified, id]);
      return res.json({ success: true, is_verified: newVerified });
    }

    res.status(400).json({ success: false, message: 'Invalid target specified.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  searchLocationCompanies,
  getCompanyDetails,
  getLocationMetadata,
  adminAddOffice,
  adminUpdateCompany,
  adminToggleStatus,
};
