const SubscriptionState = {
  ACTIVE: 'Active',
  ENDING: 'Ending',
  ENDED: 'Ended'
};

document.getElementById('datePicker').valueAsDate = new Date(); 
let processingDate = document.getElementById('datePicker').valueAsDate; 

let subscription = {
  id: '',
  state: null,
  startDate: null,
  endDate: null,
  frequency: null,
  discountGroup: null,
  gracePeriod: null,
  nextBillingDate: null,
  feeAmount: null
};

function createSubscription() {
  subscription.state = SubscriptionState.ACTIVE;
  subscription.startDate = formatDate(processingDate);
  subscription.id = generateSubscriptionID();
  subscription.frequency = document.getElementById('frequencySelect').value;
  subscription.gracePeriod = document.getElementById('gracePeriod').value;
  subscription.nextBillingDate = formatDate(calculateFirstBillingDate(processingDate,subscription.gracePeriod));
  subscription.startDate = subscription.nextBillingDate;  
  subscription.discountGroup = document.getElementById('discountGroupSelect').value;
  subscription.feeAmount = calculateFeeAmount(subscription.discountGroup);
  addToAuditLog('created');
  updateUI();
}

function calculateFirstBillingDate(startDate, grace) {
  // Calaculate the first billing date based on the grace period and start date
  console.log('Calculating first billing date with start date:', formatDate(startDate), ` and grace `, grace);
  const dayOfMonth = new Date(startDate).getDate(); // new Date(currentDate.getDate());
  let firstBill;
  if (grace == 0) {
    firstBill = new Date(startDate.getTime());
  } else {
    firstBill = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    firstBill.setMonth(startDate.getMonth() + Number(grace),1);
    const daysInFirstBillingMonth = daysInMonth(firstBill.getMonth(),firstBill.getFullYear());
    if (startDate.getDate() >=  daysInFirstBillingMonth) {
      firstBill.setDate(daysInFirstBillingMonth);
    } else {
      firstBill.setDate( startDate.getDate());
    }
  }
  console.log('First billing date calculated to be:', formatDate(firstBill));
  return firstBill;
}

function calculateNextBillingDate(startDate, frequency, currentDate) {
  // Calculate the next billing date based on the frequency and current date
  // Next billing date cannot be in the past, or less than the first bill date
  console.log('Start of calculateNextBillingDate');
  let nextBill;
  let daysInFirstBillingMonth;
  //convert start date string to date type
  const fromDate = new Date(startDate.split('/').reverse().join('/')); //format is dd/mm/yyyy, JS Date() parses mm/dd/yyyy so we need to reverse the order
  const fromYear = fromDate.getFullYear();
  const fromMonth = fromDate.getMonth();
  const fromDayOfMonth = fromDate.getDate();

  const firstBill = calculateFirstBillingDate(fromDate, subscription.gracePeriod);
  const monthlyIncrement = frequency === "monthly" ? 1 : frequency === "quarterly" ? 3 : 12;
  let months = fromMonth + monthlyIncrement;
  do {
    nextBill = new Date(fromDate);
    // console.log(`billing date before roll: ${nextBill}`);
    // console.log(`roll to month : ${months}`); 
    nextBill.setMonth(months,1);
    daysInBillingMonth = daysInMonth(nextBill.getMonth(),nextBill.getFullYear());
    if (fromDayOfMonth >=  daysInBillingMonth) {
      nextBill.setDate(daysInBillingMonth);
    } else {
      nextBill.setDate(fromDayOfMonth);
    }
    // console.log(`billing date after roll: ${nextBill}`);
    months=months+monthlyIncrement;
    if (formatDate(nextBill) ==formatDate(currentDate)) {
      //seem there is an issue with the date object when comparing dates with differnt timezones
      currentDate = nextBill;
    }     
  } while (nextBill < currentDate);

  if (firstBill > nextBill) {
    nextBill = firstBill;
  }
  
  console.log('Next Billing Date calculated to be:', formatDate(nextBill));
  return nextBill;
}
function daysInMonth (month, year) {
  //bump to next month.. so the 0 returns the last day of last month
  const result = new Date(year, month+1, 0).getDate();
  return result;
}

function calculateFeeAmount(discountGroup) {
  switch (discountGroup) {
    case 'silver': return '$15.00';  // $15 per month
    case 'gold': return '$10.00'; // $10 per month
    case 'platinum': return '$5.00'; // $5 per month
    case 'none': return '$20.00';
    default: return '$20.00';
  }
}
function endSubscriptionNow() {

  subscription.state = SubscriptionState.ENDED;
  subscription.endDate = formatDate(processingDate);
  subscription.nextBillingDate = null;
  addToAuditLog(`ended immediately. Pro Rata Refund to be calaculated`);
  updateUI();
  
  // Disable the "End" buttons and enable the "Restart" button
  document.getElementById('endNowButton').disabled = true;
  document.getElementById('endNextBillButton').disabled = true;
  document.getElementById('restartButton').disabled = false;
}
// function calculateProRataRefund(startDate, nextBillingDate, endDate) {
//   const daysInBillingPeriod = daysBetween(startDate, nextBillingDate);
//   const daysUsed = daysBetween(startDate, endDate);
//   const refundAmount = (daysUsed / daysInBillingPeriod) * subscription.feeAmount;
//   return refundAmount.toFixed(2);
// }
// function daysBetween(date1, date2) {
//   const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
//   return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
// }

function endSubscriptionNextBill() {
    subscription.state = SubscriptionState.ENDING;
    subscription.endDate = subscription.nextBillingDate;
    addToAuditLog('to end on next billing date');
    updateUI();
    
    // Disable the "End" buttons and enable the "Restart" button
    document.getElementById('endNowButton').disabled = true;
    document.getElementById('endNextBillButton').disabled = true;
    document.getElementById('restartButton').disabled = false;
}

function restartSubscription() {
processingDate = new Date(document.getElementById('datePicker').value);
const previousSubscriptionID = subscription.id;
let action = null;
if (subscription.state === SubscriptionState.ENDING) {
    subscription.endDate = null;
    action = `restarted`;
}

if (subscription.state === SubscriptionState.ENDED) {
    subscription.id = generateSubscriptionID();
    subscription.startDate = formatDate(processingDate);
    subscription.endDate = null;
    subscription.nextBillingDate = formatDate(processingDate); // processingDate;
    action = `created/restarted using subscription ${previousSubscriptionID}`;
}

subscription.state = SubscriptionState.ACTIVE;

addToAuditLog(action);
updateUI();
}

function updateDate() {
  console.log('Updating date');
  processingDate = new Date(document.getElementById('datePicker').value);
  document.getElementById('currentDate').textContent = 'Processing Date: ' + formatDate(processingDate);

  if (subscription.state == SubscriptionState.ACTIVE) {
    const BillingDate = new Date(subscription.nextBillingDate.split('/').reverse().join('/')); //format is dd-mm-yyyy, JS Date() parses mm-dd-yyyy so we need to reverse the order
    const newNextBillingDate = calculateNextBillingDate(subscription.startDate, subscription.frequency, processingDate);
    if (BillingDate !== newNextBillingDate) {
      subscription.nextBillingDate = formatDate(newNextBillingDate);
      addToAuditLog(`Billing date was updated to ${formatDate(newNextBillingDate)}`);
    }
  }

  if (subscription.endDate) {
    const endDate = new Date(subscription.endDate.split('/').reverse().join('/')); //format is dd-mm-yyyy, JS Date() parses mm-dd-yyyy so we need to reverse the order
    if (processingDate < endDate ) {
      subscription.state = SubscriptionState.ENDING;
      addToAuditLog('Subscription Ending due to processing date');
    } else if (processingDate >= endDate) {
        subscription.state = SubscriptionState.ENDED;
        addToAuditLog('Subscription Ended due to processing date');
    } 
  } else {
    subscription.state = SubscriptionState.ACTIVE;
  }
  
  updateUI();
}
function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString('en-AU', options);
}

function generateSubscriptionID() {
  // Example: Generate a unique subscription ID (not implemented)
  return Math.floor(Math.random() * 1000);
}

function updateUI() {
document.getElementById('subscriptionState').textContent = subscription.state;
document.getElementById('subscriptionID').textContent = subscription.id || '-';
document.getElementById('startDate').textContent = subscription.startDate || '-';
document.getElementById('endDate').textContent = subscription.endDate || '-';
document.getElementById('feeAmount').textContent = subscription.feeAmount || '-';
document.getElementById('nextBillingDate').textContent = subscription.nextBillingDate || '-';

const createButton = document.getElementById('createButton');
const endNowButton = document.getElementById('endNowButton');
const endNextBillButton = document.getElementById('endNextBillButton');
const restartButton = document.getElementById('restartButton');

if (subscription.state === 'Error') {
    endNowButton.disabled = true;
    endNextBillButton.disabled = true;
    restartButton.disabled = true;
} else if (subscription.id === '') {
    createButton.disabled = false;
    endNowButton.disabled = true;
    endNextBillButton.disabled = true;
    restartButton.disabled = true;
} else if (subscription.endDate){
    createButton.disabled = true;
    endNowButton.disabled = true;
    endNextBillButton.disabled = true;
    restartButton.disabled = false;
} else {
    createButton.disabled = true;
    endNowButton.disabled = false;
    endNextBillButton.disabled = false;
    restartButton.disabled = true;
}
}

function addToAuditLog(action) {
const auditLog = document.getElementById('auditLog');
const timestamp = document.getElementById('datePicker').value ? formatDate(processingDate) : formatDate(new Date());
const logEntry = `${timestamp} - Subscription ID: ${subscription.id} - ${action}\n`;
auditLog.value += logEntry;
}

function clearAuditLog() {
  document.getElementById('auditLog').value = '';
}

function resetSubscription() {
const previousSubscriptionID = subscription.id;
subscription.id = '';
subscription.state = null;
subscription.startDate = null;
subscription.endDate = null;
subscription.nextBillingDate = null;
subscription.feeAmount=null;

clearAuditLog();
updateUI();
}
