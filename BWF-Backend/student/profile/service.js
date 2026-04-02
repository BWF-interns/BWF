function validateStudentUpdate(data) {
  const errors = [];

  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push("Invalid email format");
  }

  if (data.contactNumber && !/^\+?\d{10,15}$/.test(data.contactNumber)) {
    errors.push("Invalid phone number");
  }

  if (data.DOB && isNaN(Date.parse(data.DOB))) {
    errors.push("Invalid date of birth");
  }

  if (data.name && data.name.length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  return errors;
}