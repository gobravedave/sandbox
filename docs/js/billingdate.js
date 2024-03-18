function calculateBillingDate() {
    console.log("Calculating billing date");
    const startDateInput = document.getElementById("startDate");
    const billingFrequencyInput = document.getElementById("billingFrequency");
    const processingDateInput = document.getElementById("processingDate");
    let result;

    if (!startDateInput || !billingFrequencyInput || !processingDateInput) {
        result  `Error: Null pointer reference: One or more input elements are missing`;
    }

    const startDate = new Date(startDateInput.value);
    const frequency = billingFrequencyInput.value === "monthly" ? 1 : billingFrequencyInput.value === "quarterly" ? 3 : 12;
    const processingDate = new Date(processingDateInput.value);

    if (isNaN(startDate.getTime()) || isNaN(processingDate.getTime())) {
        result =`Error: Invalid date input: Start date or processing date is not a valid date`;
    }

    if (startDate.getTime() === processingDate.getTime()) {
        const nextBillingDate = formatDate(startDate);
        result = `Start: ${formatDate(startDate)}|Freq: ${frequency}|Proc: ${formatDate(processingDate)}|Next Bill: ${nextBillingDate}`;
    } else if (startDate < processingDate) {
        
        const nextBillingDate = calculateNextBillingDate(startDate, frequency, processingDate);
        result = `Start: ${formatDate(startDate)}|Freq: ${frequency}|Proc: ${formatDate(processingDate)}|Next Bill: ${nextBillingDate}`;
    } else {
        result= `Error: (Start date must be before processing date)`;
    }

    console.log(result);
    addToResultLog(result);
}
  
// calculate next billing date by calculating the number of months between the start date and processing date, rounding up if there is a remainder, and returning a date value that is greater than or equal to the user-supplied processing date
function calculateNextBillingDate(startDate, frequency, processingDate) {
    console.log("calculateNextBillingDate() called with", formatDate(startDate), frequency, formatDate(processingDate));
    let result;
    if (startDate instanceof Date && processingDate instanceof Date && frequency > 0) {
        console.log("Start date and processing date are valid");
        const dateDiff = calculatePeriodsBetweenDates(startDate,processingDate);
        // console.log("Date difference:", dateDiff);
        let monthIncrement = dateDiff.inMonths; 
        // console.log(`Month increment before frequency-based increment: ${monthIncrement}`);
        //if not an aniversary, increment months based on frequency
        console.log(`frequency ${frequency}`);
        switch (frequency) {
            case 1: //monthly
            // console.log(`days diff ${dateDiff.days}`);
            if (dateDiff.days > 0) {
                    monthIncrement +=1;
                    // console.log(`Incrementing month increment by 1 month because there are ${dateDiff.days} days since the last billing date`);
                }
                break;
            case 3: //quarterly
                if (dateDiff.months > 0 || dateDiff.days > 0) {
                    monthIncrement= (dateDiff.years * 12) + (dateDiff.quarters*3) +3;
                    // console.log(`Incrementing month increment by 3 months because there are ${dateDiff.months} months and ${dateDiff.days} days since the last billing date`);
                }
                break;
            case 12: //yearly
                if (dateDiff.quarters > 0 || dateDiff.months > 0 || dateDiff.days > 0) {
                    monthIncrement= dateDiff.years * 12 +12;
                    // console.log(`Incrementing month increment by 12 months because there are ${dateDiff.quarters} quarters, ${dateDiff.months} months, and ${dateDiff.days} days since the last billing date`);
                }
                break;
            default:
                result=`Error: Invalid frequency: ${frequency}`;
                break;
        }
        console.log(`months to increment: ${monthIncrement}`);
        const nextBillingDate = addMonthsToDate(startDate, monthIncrement);
        console.log(`Next billing date`, nextBillingDate);
        result= `Next billing date:, ${nextBillingDate}`;
        return nextBillingDate;
    } else {
        result = `Error: Invalid input. Please provide valid start date, frequency, and processing date`;
    }

    console.log(result);
    addToResultLog(result);

}

function calculatePeriodsBetweenDates(date1, date2) {
    const years = date2.getFullYear() - date1.getFullYear();
    const quarters = Math.floor((date2.getMonth() - date1.getMonth()) / 3);
    const months = (date2.getMonth() - date1.getMonth()) % 12;
    const days = date2.getDate() - date1.getDate();
    const inMonths = years*12 + quarters*3 + months;
    return { years: years, quarters: quarters, months: months, days: days, inMonths: inMonths };
}

function addMonthsToDate(date, months) {
    console.log(`Adding ${months} months to date`, formatDate(date));
    let newDate = new Date(date.getFullYear(), date.getMonth() + months, 1);
    console.log(`New date`, formatDate(newDate));
    let daysInMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    console.log(`Days in month`, daysInMonth);
    newDate.setDate(Math.min(date.getDate(), daysInMonth));
    console.log(`Final new date`, formatDate(newDate));
    return formatDate(newDate);
  }


function addToResultLog(result) {
    const resultLog = document.getElementById('resultLog');
    const logEntry = `${result}\n`;
    resultLog.value += logEntry;
    }

function clearResultLog() {
    document.getElementById('resultLog').value = '';
    }

function formatDate(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-AU', options);
    }

function testAddMonthsToDate() {
    const testCases = [
        { date: "2023-01-31", months: 1, expected: { date: "28/02/2023"}},
        { date: "2024-01-31", months: 1, expected: { date: "29/02/2024"}},
        { date: "2021-01-31", months: 4, expected: { date: "31/05/2021"}},
        { date: "2024-02-29", months: 5, expected: { date: "29/07/2024" }},
        { date: "2024-02-29", months: 24, expected: { date: "28/02/2026" }},
        { date: "2024-02-29", months: 26, expected: { date: "29/04/2026" }}
        ];
    testCases.forEach((testCase) => {
    const result = addMonthsToDate(new Date(testCase.date), testCase.months);
    console.log("Testing date:", testCase.date, "months to add:", testCase.months);
    console.log("Expected:", testCase.expected);
    console.log("Actual:", result);
    });
}
    
function testCalculateNextBillingDate() {
    const testCases = [
        { date1: `2021-01-01`, frequency: 1, date2: `2021-03-01`, expected: { nextBillingDate: "01/03/2021" }},
        { date1: "2024-01-31", frequency: 1, date2: "2025-01-31", expected: { nextBillingDate: "31/01/2025"  }},
        { date1: "2023-01-31", frequency: 12, date2: "2024-01-31", expected: { nextBillingDate: "31/01/2024"  }},
        { date1: "2024-02-29", frequency: 1, date2: "2024-03-31", expected: { nextBillingDate: "29/04/2021"  }},
        { date1: "2024-02-29", frequency: 12, date2: "2025-01-30", expected:  {nextBillingDate: "28/02/2025"  }}
        ];
    let testnbr = 1
    testCases.forEach((testCase) => {
        addToResultLog("testcase" +testnbr + `: Start=${testCase.date1} Frequency=${testCase.frequency} As at=${testCase.date2}`);
        const result = calculateNextBillingDate(new Date(testCase.date1), testCase.frequency, new Date(testCase.date2));     
        addToResultLog("testcase" +testnbr++ + `: Expected= ${testCase.expected.nextBillingDate} Actual= ${result}`);
        console.log("date1:", testCase.date1, "frequency:", testCase.frequency, "Testing date2:", testCase.date2);    
        console.log("Expected:", testCase.expected);
        console.log("Actual:", result);
        });
    }

function testCalculatePeriodsBetweenDates() {
    const testCases = [
        { date1: `2021-01-01`, date2: `2021-03-01`, expected: { years: 0, Quarters: 0, Months: 2, Days: 0 }},
        { date1: "2024-01-31", date2: "2024-01-31", expected: { years: 0, Quarters: 0, Months: 0, Days: 0 }},
        { date1: "2023-01-31", date2: "2024-01-31", expected: { years: 1, Quarters: 0, Months: 0, Days: 0 }},
        { date1: "2023-02-29", date2: "2024-03-31", expected: { years: 1, Quarters: 0, Months: 1, Days: 2 }},
        { date1: "2023-02-29", date2: "2024-06-30", expected: { years: 1, Quarters: 1, Months: 1, Days: 1 }}
        ];

    testCases.forEach((testCase) => {
        const result = calculatePeriodsBetweenDates(new Date(testCase.date1),new Date(testCase.date2));
        console.log("date1:", testCase.date1, "Testing date2:", testCase.date2);    
        console.log("Expected:", testCase.expected);
        console.log("Actual:", result);
    });
}