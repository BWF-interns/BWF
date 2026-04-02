const Student = require("../models/student");
const { isValidUser } = require("../../auth/service");

const { validateStudentUpdate } = require("./service");

async function getStudent(req, res) {
  const { auth_id } = req.params;

  try {
    if (!isValidUser(auth_id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const student = await Student.findOne({ auth_id }).lean();

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    return res.status(200).json({
      name: student.name,
      DOB: student.DOB,
      email: student.email,
      contactNumber: student.contactNumber,
      address: student.address,
      class: student.class,
      interests: student.interests,
      avatarId: student.avatarId,
      profilePictureUrl: student.profilePictureUrl,
      trustedPerson: student.trustedPerson
    });

  } catch (error) {
    console.error("GET ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
}


async function updateStudent(req, res) {
  const { auth_id } = req.params;
  let updateData = req.body;

  try {
    if (!isValidUser(auth_id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const errors = validateStudentUpdate(updateData);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const allowedFields = [
      "name",
      "contactNumber",
      "email",
      "address",
      "class",
      "interests",
      "avatarId",
      "trustedPerson"
    ];

    updateData = Object.fromEntries(
      Object.entries(updateData).filter(([key]) =>
        allowedFields.includes(key)
      )
    );

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    if (updateData.trustedPerson) {
      const tp = updateData.trustedPerson;

      if (tp.name !== undefined)
        updateData["trustedPerson.name"] = tp.name;

      if (tp.phone !== undefined)
        updateData["trustedPerson.phone"] = tp.phone;

      if (tp.relation !== undefined)
        updateData["trustedPerson.relation"] = tp.relation;

      delete updateData.trustedPerson;
    }

    const student = await Student.findOneAndUpdate(
      { auth_id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      name: student.name,
      DOB: student.DOB,
      email: student.email,
      contactNumber: student.contactNumber,
      address: student.address,
      class: student.class,
      interests: student.interests,
      avatarId: student.avatarId,
      profilePictureUrl: student.profilePictureUrl,
      trustedPerson: student.trustedPerson
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getStudent,
  updateStudent
};