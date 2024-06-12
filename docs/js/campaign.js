document.addEventListener('DOMContentLoaded', () => {
    loadOffers();
    loadHolidays();
    document.getElementById('startSimulation').addEventListener('click', startSimulation);
    document.getElementById('fromDate').addEventListener('change', enableStartButton);
    document.getElementById('toDate').addEventListener('change', enableStartButton);
});

function loadOffers() {
    const jsonFilePath = 'datasets/zafin_offers.json';

    fetch(jsonFilePath)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('offersTable').getElementsByTagName('tbody')[0];
            tbody.innerHTML = ''; // Clear any existing rows

            data.offers.forEach(offer => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${offer.configDate}</td>
                    <td>${offer.fromDate}</td>
                    <td>${offer.toDate}</td>
                    <td>${offer.lifeCycleState}</td>
                    <td>${offer.code}</td>
                    <td>${offer.offerName}</td>
                    <td>${offer.type}</td>
                    <td>${offer.productCode}</td>
                    <td>${offer.margin}</td>
                    <td>${offer.conditions}</td>
                `;

                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
        });
}

function enableStartButton() {
    var fromDate = document.getElementById('fromDate').value;
    var toDate = document.getElementById('toDate').value;
    if (fromDate && toDate) {
        var fromDateObj = new Date(fromDate);
        var toDateObj = new Date(toDate);
        if (toDateObj > fromDateObj) {
            document.getElementById('startSimulation').disabled = false;
            errorMessage.textContent = '';
        } else {
            document.getElementById('startSimulation').disabled = true;
            errorMessage.textContent = 'To Date must be after From Date';
            errorMessage.style.color = 'red';
        }
    } else {
        document.getElementById('startSimulation').disabled = true;
    }

    document.getElementById('errorMessage').innerHTML  = errorMessage.textContent;
}

function loadHolidays() {
    const jsonFilePath = 'datasets/cap_holiday.json';

    fetch(jsonFilePath)
        .then(response => response.json())  
        .then(data => {
            const tbody = document.getElementById('holidayTable').getElementsByTagName('tbody')[0];
            tbody.innerHTML = ''; // Clear any existing rows

            data.holidays.forEach(holiday => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${holiday.date}</td>
                    <td>${holiday.description}</td>
                `;

                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
        });
}

let progress = 0;
var progressBar = document.getElementById("myBar");


function startSimulation() {

    var fromDate = document.getElementById('fromDate').value;
    var toDate = document.getElementById('toDate').value;
    var days = Math.floor((Date.parse(toDate) - Date.parse(fromDate)) / (1000 * 60 * 60 * 24));
    console.log(days);

    progress = 0;
    progressBar.style.width = 0 + "%";

    var currentDate = new Date(fromDate);
    var lastDate = new Date(toDate);
    addToAuditLog(currentDate, "simulation started");

    function processDate() {
        addToAuditLog(currentDate, "processing ");
        updateProgress(days);

        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate <= lastDate) {
            setTimeout(processDate, 1000);
        } else {
            addToAuditLog(lastDate, "simulation completed");
        }
    }    

    processDate();

}

function updateProgress(days) {
    var width;
    progress++;
    width = progress / days * 100;
    if (!isNaN(days) && progress <= days) {
        progressBar.style.width = width + "%";
        // setTimeout(updateProgress, 1000, days);
    }
}


function updateCampaigns(date) {
    const jsonFilePath = 'datasets/zafin_offers.json';

    fetch(jsonFilePath)
        .then(response => response.json())
        .then(data => {
            const campaignTableBody = document.getElementById('campaignTable').getElementsByTagName('tbody')[0];
            campaignTableBody.innerHTML = ''; // Clear any existing rows

            data.offers.forEach(offer => {
                const fromDate = new Date(offer.fromDate);
                const toDate = new Date(offer.toDate);
                const selectedDate = new Date(date);

                if (selectedDate >= fromDate && selectedDate < toDate) {
                    let existingCampaign = false;
                    const rows = campaignTableBody.getElementsByTagName('tr');
                    
                    for (let i = 0; i < rows.length; i++) {
                        if (rows[i].cells[0].textContent === offer.code) {
                            existingCampaign = true;
                            break;
                        }
                    }

                    if (!existingCampaign) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${offer.code}</td>
                            <td>${offer.fromDate}</td>
                            <td>${offer.toDate}</td>
                        `;
                        campaignTableBody.appendChild(row);
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
        });
}

function addToAuditLog(processDate, action) {
    const auditLog = document.getElementById('auditLog');
    const logEntry = `${formatDate(processDate)} - ${action}\n`;
    auditLog.value += logEntry;
    }

function formatDate(date) {
    // console.log(date);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-AU', options);
    }

// todo: add a function to calaculate processing date and next processing date based on the processing date. 
// Next processing date is to be calculated on a 5 day per week cycle (exclude Saturday & Sunday) and not be in the CAP holiday table above 
// 