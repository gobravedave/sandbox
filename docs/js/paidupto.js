function calculatePaidUpDate() {
  const startDate = new Date(document.getElementById("startDate").value);
  const today = new Date();
  const billingFrequency = document.getElementById("billingFrequency").value;

  let monthsToAdd = 0;

  switch (billingFrequency) {
    case "monthly":
      monthsToAdd = today.getMonth() - startDate.getMonth() + (today.getFullYear() - startDate.getFullYear()) * 12;
      // Consider days already passed in the current month for both start and end dates
      const daysPassedStart = startDate.getDate() === 1 ? 0 : 1; // Adjust for 1st Feb edge case
      monthsToAdd -= Math.ceil((today.getDate() - 1) / 31) - daysPassedStart;
      break;
    case "quarterly":
      monthsToAdd = Math.floor((today.getMonth() - startDate.getMonth()) / 3) + (today.getFullYear() - startDate.getFullYear()) * 4;
      // Adjust for days already passed in the current quarter
      const currentQuarter = Math.floor(today.getMonth() / 3) + 1;
      const startQuarter = Math.floor(startDate.getMonth() / 3) + 1;
      const daysPassed = today.getDate() - startDate.getDate() +
        (currentQuarter - startQuarter) * 31;
      monthsToAdd -= Math.ceil(daysPassed / 92);
      break;
    case "annually":
      monthsToAdd = (today.getFullYear() - startDate.getFullYear()) * 12;
      // Adjust for days already passed in the current year
      monthsToAdd -= Math.ceil((today.getDate() - startDate.getDate()) / 31);
      break;
    default:
      alert("Invalid billing frequency");
      return;
  }

  const paidUpDate = new Date(startDate.getTime());
  paidUpDate.setMonth(paidUpDate.getMonth() + monthsToAdd);

  // Ensure the paidUpDate falls on the anniversary of the start date
  paidUpDate.setMonth(paidUpDate.getMonth() - startDate.getMonth() +
    (paidUpDate.getFullYear() - startDate.getFullYear()) * 12);
  paidUpDate.setDate(startDate.getDate());
  // Format the paidUpDate in Australian standard format
  const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
  const formattedDate = paidUpDate.toLocaleDateString('en-AU', options);

  document.getElementById("result").textContent = "Paid up date: " + formattedDate;
}
