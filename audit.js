const API_URL = 'https://67f00fb52a80b06b8896c3bf.mockapi.io/api/v1/audit_logs';
let allLogs = [];
let filteredLogs = [];
let currentPage = 1;

async function fetchAuditLogs() {
   try {
       const response = await fetch(API_URL);
       if (!response.ok) throw new Error('Network error');
       return await response.json();
   } catch (error) {
       console.error(error);
   }
}
async function init() {
   const loadingDiv = document.getElementById('loading');
   const tableContainer = document.getElementById('tableContainer');
   
   loadingDiv.style.display = 'block';
   tableContainer.style.display = 'none';

   allLogs = await fetchAuditLogs();
   if (allLogs.length === 0) {
       loadingDiv.textContent = 'No audit logs found.';
       return;
   }
   
   populateFilters();
   updateDisplay();

   loadingDiv.style.display = 'none';
   tableContainer.style.display = 'block';
}
function populateFilters() {
   const actionTypeSelect = document.getElementById('actionType');
   const usersSet = new Set(allLogs.map(log => log.user));
   
   usersSet.forEach(user => {
       const option = document.createElement('option');
       option.value = user;
       option.textContent = user || 'Unknown User';
       actionTypeSelect.appendChild(option);
   });
}

function updateDisplay() {
   const tableBody = document.getElementById('auditTableBody');
   tableBody.innerHTML = '';
   
   filteredLogs.forEach(log => {
       const row = `<tr><td>${log.id}</td><td>${log.timestamp}</td></tr>`;
       tableBody.innerHTML += row;
   });
}

init();
