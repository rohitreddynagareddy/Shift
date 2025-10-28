// --- NO FIREBASE IMPORTS ---

// --- INITIAL MOCK DATA (Used until Excel is uploaded) ---
const initialManagerData = {
    operationalPulse: {
        kpiAdherence: { value: 96, color: 'text-green-500', bgColor: 'bg-green-500', icon: 'Target' },
        staffingLevel: { value: 90, color: 'text-blue-500', bgColor: 'bg-blue-500', icon: 'UserCheck' },
        teamWorkload: { value: 75, color: 'text-orange-500', bgColor: 'bg-orange-500', icon: 'Activity' },
        burnoutRisk: { value: 40, color: 'text-red-500', bgColor: 'bg-red-500', icon: 'Heart' },
    },
    futureCast: [
        { id: 1, type: 'Pinch Point', severity: 'High', title: 'High Ticket Volume Predicted', details: 'AI predicts a 40% spike in Jira tickets on Friday at 3 PM due to new feature deployment.', recommendation: 'Place Naresh on a paid standby shift.', icon: 'TrendingUp' },
        { id: 2, type: 'Burnout', severity: 'Medium', title: 'Burnout Forecast', details: 'Keerthi has worked 5 consecutive evening shifts.', recommendation: 'Assign her a morning shift on Thursday.', icon: 'Heart' },
        { id: 3, type: 'Skill Gap', severity: 'Low', title: 'Skill Mismatch', details: 'A critical "Azure Database" task is scheduled for Rohit, but his skill confidence is low.', recommendation: 'Initiate a smart swap with Keerthi.', icon: 'Zap' },
    ],
    teamWellness: {
        shiftBalanceScore: 'A+',
        kudos: [
            { id: 1, from: 'Manager', to: 'Keerthi', message: 'Resolved a P1 ticket in under 30 minutes!' },
            { id: 2, from: 'Naresh', to: 'Rohit', message: 'Thanks for helping with the deployment script.' }
        ],
        upcomingLeave: [ { name: 'Rohit', days: 3 } ]
    },
    teamTickets: [
        { name: 'Rohit', role: 'Development', serviceNow: 5, jira: 8, csat: 92, ticketsResolved: 13, avgResolutionTime: 45 },
        { name: 'Keerthi', role: 'Operations', serviceNow: 3, jira: 12, csat: 98, ticketsResolved: 15, avgResolutionTime: 30 },
        { name: 'Naresh', role: 'DBA', serviceNow: 7, jira: 4, csat: 95, ticketsResolved: 11, avgResolutionTime: 55 },
    ],
    analytics: {
        last30Days: {
            avgResolutionTime: 43,
            firstContactResolution: 85,
            csat: 95,
            ticketVolume: [
                { date: 'Week 1', volume: 110 }, { date: 'Week 2', volume: 140 },
                { date: 'Week 3', volume: 125 }, { date: 'Week 4', volume: 155 },
            ],
            ticketCategories: [
                { name: 'Bug Report', value: 400, color: '#3b82f6' },
                { name: 'Feature Request', value: 300, color: '#10b981' },
                { name: 'Password Reset', value: 180, color: '#f97316' },
                { name: 'Billing Inquiry', value: 120, color: '#8b5cf6' },
            ]
        }
    }
};

const initialEngineerData = {
    name: 'Rohit',
    personalPulse: {
        currentShift: 'Morning',
        workload: 65, tasksCompleted: 5, tasksPending: 3,
    },
    weekAhead: [
        { day: 'Mon', shift: 'Morning' }, { day: 'Tue', shift: 'Morning' },
        { day: 'Wed', shift: 'Evening' }, { day: 'Thu', 'shift': 'Evening' },
        { day: 'Fri', shift: 'Off' }, { day: 'Sat', shift: 'Off' }, { day: 'Sun', shift: 'Morning' },
    ],
    myTickets: { serviceNow: 5, jira: 8 },
    myKudos: [ { id: 1, from: 'Naresh', message: 'Thanks for helping with the deployment script.' } ],
    aiAgent: {
        isOnLeave: false,
        tasks: [
            { id: 1, name: 'Send Azure Health Check Mail', status: 'Completed' },
            { id: 2, name: 'Generate Weekly Performance Report', status: 'In Progress' },
        ]
    }
};

// --- GLOBAL STATE ---
let state = {
    userType: 'manager',
    view: 'home',
    managerData: JSON.parse(JSON.stringify(initialManagerData)), // Deep copy
    engineerData: JSON.parse(JSON.stringify(initialEngineerData)), // Deep copy
    isLoading: false, // No initial loading from backend
    currentMonth: new Date(),
    generatedRoster: null,
    isRosterLoading: false,
    rosterError: null,
    requestViewTab: 'swap', // 'swap' or 'leave'
    leaveRequests: [],
    swapRequests: [],
    uploadedFileName: null,
};

// --- DOM ELEMENTS ---
const appContainer = document.getElementById('app-container');

// --- DYNAMIC ICON COMPONENT ---
const Icon = (name, props = {}) => {
    const { size = 20, className = '' } = props;
    const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-(\w)/g, g => g[1].toUpperCase());
    const iconNode = lucide.icons[camelCaseName];
    if (!iconNode) {
        console.warn(`Lucide icon not found: ${name} (as ${camelCaseName})`);
        return `<svg width="${size}" height="${size}" class="${className}"></svg>`; // Return empty SVG as fallback
    }
    return iconNode.toSvg({ width: size, height: size, class: className });
};

// --- HELPER FUNCTIONS ---
const getRoleColor = (role) => {
    switch (role) {
        case 'Development': return 'bg-blue-100 text-blue-800';
        case 'Operations': return 'bg-green-100 text-green-800';
        case 'DBA': return 'bg-purple-100 text-purple-800';
        case 'Support': return 'bg-pink-100 text-pink-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- CUSTOM MODAL FOR ALERTS ---
const showModal = (message, type = 'info') => {
    const modalId = 'custom-modal';
    let existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();

    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 animate-pulse';
    modal.classList.add(bgColor);
    modal.innerHTML = `
        <span>${message}</span>
        <button id="modal-close-btn" class="ml-4 font-bold">X</button>
    `;
    document.body.appendChild(modal);

    document.getElementById('modal-close-btn').onclick = () => modal.remove();
    setTimeout(() => modal.remove(), 5000);
};

// --- RENDER FUNCTIONS (Most are unchanged) ---

const renderSidebar = () => {
    const { userType, view } = state;
    const managerLinks = [
        { name: 'Home', iconName: 'Briefcase', view: 'home' },
        { name: 'AI Roster Generator', iconName: 'BrainCircuit', view: 'roster' },
        { name: 'Team Analytics', iconName: 'BarChart2', view: 'analytics' },
        { name: 'Schedule Manager', iconName: 'Calendar', view: 'schedule' },
    ];
    const engineerLinks = [
        { name: 'Home', iconName: 'Briefcase', view: 'home' },
        { name: 'My Schedule', iconName: 'Calendar', view: 'schedule' },
        { name: 'Request Swap/Leave', iconName: 'ArrowRightLeft', view: 'request' },
        { name: 'My Performance', iconName: 'BarChart2', view: 'performance' },
    ];
    const links = userType === 'manager' ? managerLinks : engineerLinks;

    return `
        <div class="bg-custom-blue text-gray-300 w-64 min-h-screen p-4 flex-col hidden lg:flex">
            <div class="flex items-center mb-10">
                <div class="bg-gradient-to-br from-sky-500 to-blue-600 p-2 rounded-lg mr-3 shadow-lg">
                    ${Icon('Shield', { size: 28, className: 'text-white' })}
                </div>
                <h1 class="text-2xl font-bold text-white">Roster Genius</h1>
            </div>
            <nav class="flex-grow">
                <ul>
                    ${links.map(link => `
                        <li class="mb-2">
                            <a href="#" data-view="${link.view}" class="sidebar-link flex items-center p-3 rounded-lg transition-all duration-200 ${view === link.view ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-custom-blue-hover'}">
                                ${Icon(link.iconName, { size: 20 })}
                                <span class="ml-3 font-medium">${link.name}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </nav>
            <div class="mt-auto">
                <div class="text-xs text-gray-400 p-2">
                    Data Source: ${state.uploadedFileName ? `<span class="font-semibold text-green-300">${state.uploadedFileName}</span>` : '<span class="text-yellow-300">Using Sample Data</span>'}
                </div>
            </div>
        </div>
    `;
};

const renderHeader = () => {
    const { userType } = state;
    return `
        <header class="bg-white shadow-sm p-4 flex justify-between items-center z-10">
            <h2 class="text-2xl font-bold text-gray-800">${userType === 'manager' ? "Manager's Command Center" : `Engineer's Dashboard (${state.engineerData.name})`}</h2>
            <div class="flex items-center">
                <div class="relative mr-4" id="user-type-dropdown-container">
                    <button id="user-type-toggle" class="flex items-center text-gray-600 hover:text-gray-900">
                        ${Icon('User', { size: 20, className: 'mr-2' })}
                        <span class="font-semibold">${userType === 'manager' ? 'Manager' : 'Engineer'} View</span>
                        ${Icon('ChevronDown', { size: 16, className: 'ml-1' })}
                    </button>
                    <div id="user-type-dropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 hidden">
                        <a href="#" id="switch-user-type" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                            Switch to ${userType === 'manager' ? 'Engineer' : 'Manager'}
                        </a>
                    </div>
                </div>
                <button class="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Invite</button>
                <button class="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Publish Roster</button>
            </div>
        </header>
    `;
};

const renderDashboardCard = (content, className = '') => `
    <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}">
        ${content}
    </div>
`;

const renderManagerDashboard = () => {
    const { managerData } = state;
    if (!managerData) return renderLoadingSpinner();

    const keyMetricCards = Object.entries(managerData.operationalPulse).map(([key, data]) => {
        const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return renderDashboardCard(`
            <div class="flex items-center justify-between">
                <h4 class="font-semibold text-gray-600">${title}</h4>
                <div class="${data.color}">${Icon(data.icon)}</div>
            </div>
            <div>
                <span class="text-4xl font-bold ${data.color}">${data.value}%</span>
                <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div class="${data.bgColor} h-2.5 rounded-full" style="width: ${data.value}%"></div>
                </div>
            </div>
        `, 'flex flex-col justify-between');
    }).join('');

    const futureCastRadar = renderDashboardCard(`
        <h3 class="font-bold text-xl mb-4 text-gray-800">Future-Cast Radar (Next 72 Hours)</h3>
        <div class="space-y-4">
            ${managerData.futureCast.map(item => `
                <div class="bg-gray-50 p-4 rounded-lg border-l-4" style="border-color: ${item.severity === 'High' ? '#ef4444' : item.severity === 'Medium' ? '#f97316' : '#3b82f6'}">
                    <div class="flex items-center mb-2">
                        ${Icon(item.icon, { className: item.severity === 'High' ? 'text-red-500' : item.severity === 'Medium' ? 'text-orange-500' : 'text-blue-500' })}
                        <h4 class="ml-3 font-bold text-gray-900">${item.title}</h4>
                    </div>
                    <p class="text-gray-600 mb-3">${item.details}</p>
                    <div class="bg-blue-100 text-blue-800 p-3 rounded-md flex items-center">
                        ${Icon('Sparkles', { size: 18, className: 'mr-3' })}
                        <p class="font-semibold text-sm">${item.recommendation}</p>
                        <button class="ml-auto bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-blue-700">Take Action</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `, 'col-span-1 lg:col-span-3');

    const teamWellnessHub = renderDashboardCard(`
        <h3 class="font-bold text-xl mb-4 text-gray-800">Team Wellness & Engagement</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold mb-2 text-gray-700">Shift Fairness Score</h4>
                <div class="flex items-center justify-center bg-green-100 text-green-800 rounded-lg p-4">
                    <span class="text-5xl font-bold">${managerData.teamWellness.shiftBalanceScore}</span>
                </div>
                <p class="text-xs text-center mt-1 text-gray-500">Based on weekend & evening shift distribution.</p>
            </div>
            <div>
                <h4 class="font-semibold mb-2 text-gray-700">Kudos Corner</h4>
                <div class="space-y-2">
                    ${managerData.teamWellness.kudos.map(kudo => `
                        <div class="bg-yellow-50 p-2 rounded-lg text-sm">
                            <p class="text-yellow-800"><span class="font-bold">${kudo.from}</span> to <span class="font-bold">${kudo.to}:</span> ${kudo.message}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <h4 class="font-semibold mb-2 text-gray-700">Upcoming Time Off</h4>
            ${managerData.teamWellness.upcomingLeave.map(leave => `
                <p class="text-gray-600">🌴 <span class="font-bold">${leave.name}'s</span> vacation starts in <span class="font-bold">${leave.days}</span> days!</p>
            `).join('')}
        </div>
    `, 'col-span-1 lg:col-span-2');

    return `
        <div class="p-8 bg-gray-100 flex-1">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${keyMetricCards}
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                ${futureCastRadar}
                ${teamWellnessHub}
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
                 ${renderDashboardCard(`
                    <h3 class="font-bold text-xl mb-4 text-gray-800">Team Ticket Distribution</h3>
                    <div id="team-ticket-chart" style="width: 100%; height: 300px;"></div>
                `, 'col-span-1 lg:col-span-2')}
            </div>
        </div>
    `;
};

const renderEngineerDashboard = () => {
    const { engineerData } = state;
    if (!engineerData) return renderLoadingSpinner();

    const personalPulseCards = `
        ${renderDashboardCard(`
            <h3 class="font-bold text-lg mb-2 text-gray-800">Current Workload</h3>
            <div id="workload-chart" style="width: 100%; height: 120px;"></div>
        `, 'col-span-2 md:col-span-1 flex flex-col items-center justify-center')}
        ${renderDashboardCard(`
            <div class="flex justify-center items-center mb-2 text-blue-500">${Icon('CheckCircle', {size: 24})}</div>
            <h4 class="font-semibold text-gray-600 mb-1">Tasks Completed</h4>
            <p class="text-3xl font-bold text-gray-800">${engineerData.personalPulse.tasksCompleted}</p>
        `, 'text-center')}
        ${renderDashboardCard(`
            <div class="flex justify-center items-center mb-2 text-blue-500">${Icon('Clock', {size: 24})}</div>
            <h4 class="font-semibold text-gray-600 mb-1">Tasks Pending</h4>
            <p class="text-3xl font-bold text-gray-800">${engineerData.personalPulse.tasksPending}</p>
        `, 'text-center')}
         ${renderDashboardCard(`
            <div class="flex justify-center items-center mb-2 text-blue-500">${Icon('Ticket', {size: 24})}</div>
            <h4 class="font-semibold text-gray-600 mb-1">Total Tickets</h4>
            <p class="text-3xl font-bold text-gray-800">${engineerData.myTickets.serviceNow + engineerData.myTickets.jira}</p>
        `, 'text-center')}
    `;

    const weekAhead = renderDashboardCard(`
        <h3 class="font-bold text-xl mb-4 text-gray-800">My Week Ahead</h3>
        <div class="flex flex-wrap justify-between text-center -m-1">
            ${engineerData.weekAhead.map(item => `
                <div class="w-1/2 sm:w-1/3 md:flex-1 p-1">
                    <div class="p-2 rounded-lg h-full flex flex-col justify-center">
                        <p class="font-bold text-gray-800">${item.day}</p>
                        <div class="mt-2 p-3 rounded-md text-sm font-semibold ${
                            item.shift === 'Morning' ? 'bg-blue-100 text-blue-800' :
                            item.shift === 'Evening' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-200 text-gray-700'
                        }">${item.shift}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `);

    const aiAgentStatus = engineerData.aiAgent.isOnLeave ? `
        <div class="space-y-3 bg-green-50 p-4 rounded-lg">
            <p class="text-sm font-semibold text-green-700 mb-2">AI Backup is Active. It will handle:</p>
            ${engineerData.aiAgent.tasks.map(task => `
                <div class="flex items-center text-sm text-gray-700">
                    ${Icon('CheckCircle', { size: 16, className: 'text-green-600 mr-2 flex-shrink-0' })}
                    <span>${task.name}</span>
                    <span class="ml-auto text-xs font-medium px-2 py-1 rounded-full ${task.status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}">${task.status}</span>
                </div>
            `).join('')}
        </div>
    ` : `
        <div class="text-center flex flex-col justify-center items-center h-full p-4 bg-gray-50 rounded-lg">
            ${Icon('Sparkles', { size: 24, className: 'text-gray-400 mb-2' })}
            <p class="text-sm text-gray-500 font-medium">AI Assistant is on standby.</p>
        </div>
    `;

    const quickActionsAndAI = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${renderDashboardCard(`
                <h3 class="font-bold text-xl mb-4 text-gray-800">Quick Actions</h3>
                <div class="flex flex-col space-y-3">
                    <button class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-semibold">
                        ${Icon('ArrowRightLeft', { size: 18, className: 'mr-2' })} Request Shift Swap
                    </button>
                    <button class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center font-semibold">
                        ${Icon('LogOut', { size: 18, className: 'mr-2' })} Apply for Leave
                    </button>
                </div>
            `, 'lg:col-span-1')}
            ${renderDashboardCard(`
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-xl text-gray-800">AI Assistant</h3>
                        <p class="text-sm text-gray-500">Going on leave? Toggle on to activate your AI backup.</p>
                    </div>
                    <label for="leave-toggle" class="flex items-center cursor-pointer">
                        <div class="relative">
                            <input type="checkbox" id="leave-toggle" class="sr-only" ${engineerData.aiAgent.isOnLeave ? 'checked' : ''} />
                            <div class="block bg-gray-200 w-12 h-7 rounded-full"></div>
                            <div class="dot absolute left-1 top-1 w-5 h-5 rounded-full shadow-md transition-transform duration-300 ease-in-out ${engineerData.aiAgent.isOnLeave ? 'transform translate-x-full bg-green-500' : 'bg-gray-400'}"></div>
                        </div>
                    </label>
                </div>
                <div>${aiAgentStatus}</div>
            `, 'lg:col-span-2')}
        </div>
    `;

    return `
        <div class="p-8 bg-gray-100 flex-1 space-y-8">
            ${renderDashboardCard(`
                <h2 class="text-3xl font-bold text-gray-800">Welcome, ${engineerData.name}!</h2>
                <p class="text-gray-600 mt-1">Here is your command center for today. Your current shift is: <span class="font-bold text-blue-600">${engineerData.personalPulse.currentShift}</span>.</p>
            `)}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                ${personalPulseCards}
            </div>
            ${weekAhead}
            ${quickActionsAndAI}
        </div>
    `;
};

const renderAIRosterGenerator = () => {
    const { generatedRoster, isRosterLoading, rosterError } = state;
    const rosterTable = generatedRoster ? `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border rounded-lg">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                        <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning</th>
                        <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Afternoon</th>
                        <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evening</th>
                        <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Night</th>
                        <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Off</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    ${Object.entries(generatedRoster).map(([day, shifts]) => `
                        <tr>
                            <td class="py-4 px-4 whitespace-nowrap font-medium text-gray-900">${day}</td>
                            ${["Morning", "Afternoon", "Evening", "Night"].map(shift => `
                                <td class="py-4 px-4 whitespace-nowrap text-gray-600 space-y-1">
                                    ${shifts[shift] && shifts[shift].map(person => `
                                        <div class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(person.role)}">
                                            ${person.name}
                                        </div>
                                    `).join('')}
                                </td>
                            `).join('')}
                            <td class="py-4 px-4 whitespace-nowrap text-gray-600"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">${shifts.Off}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    ` : '';

    const excelUploadSection = `
        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
            <h2 class="text-xl font-bold text-gray-800 mb-2">Upload Employee Roster</h2>
            <p class="text-gray-600 mb-4">Upload an Excel file (.xlsx, .xls) with an "Employees" sheet. Required columns: <strong>Name</strong> and <strong>Role</strong>. Optional columns: <strong>ServiceNow</strong>, <strong>Jira</strong>, <strong>CSAT</strong>, etc.</p>
            <div class="flex items-center space-x-4">
                <label for="excel-upload" class="file-input-button">
                    ${Icon('Upload', {size: 20, className: 'mr-2'})}
                    <span>Choose File</span>
                </label>
                <input type="file" id="excel-upload" accept=".xlsx, .xls">
                <span id="file-name-display" class="text-gray-600">No file chosen</span>
            </div>
        </div>
    `;

    return `
        <div class="p-8 bg-gray-100 flex-1">
            ${renderDashboardCard(`
                <div class="flex items-center mb-4">
                    ${Icon("BrainCircuit", { size: 32, className: "text-blue-600 mr-3" })}
                    <h1 class="text-3xl font-bold text-gray-800">Automated Roster Generator</h1>
                </div>
                ${excelUploadSection}
                <p class="text-gray-600 mb-6">This tool automatically generates a balanced schedule based on the roles from your uploaded file, historical workload, and shift fairness.</p>
                <div class="mb-6">
                    <label for="constraints" class="block text-sm font-medium text-gray-700 mb-1">Additional Constraints</label>
                    <textarea id="constraints" rows="3" placeholder="e.g., Keerthi needs Saturday off" class="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <button id="generate-roster-btn" ${isRosterLoading ? 'disabled' : ''} class="w-full flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                    ${isRosterLoading ? `
                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Generating...
                    ` : `
                        ${Icon("Sparkles", { size: 20, className: "mr-2" })}
                        Generate Roster
                    `}
                </button>
                ${rosterError ? `<div class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">${rosterError}</div>` : ''}
            `)}
            ${generatedRoster ? renderDashboardCard(rosterTable, 'mt-8') : ''}
        </div>
    `;
};

const renderTeamAnalytics = () => {
     const { managerData } = state;
     if (!managerData) return renderLoadingSpinner();
     const analyticsData = managerData.analytics.last30Days;

     const kpiCards = `
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             ${renderDashboardCard(`
                 <div class="flex items-center justify-between mb-2">
                     <h4 class="font-semibold text-gray-600">Avg. Resolution Time</h4>
                     ${Icon('Clock', {className: "text-blue-500", size: 24})}
                 </div>
                 <p class="text-4xl font-bold text-gray-800">${analyticsData.avgResolutionTime}<span class="text-2xl text-gray-500"> min</span></p>
                 <div class="flex items-center text-sm mt-2 text-red-500">
                     ${Icon("TrendingDown", {size: 16, className: "mr-1"})}
                     <span>5% vs last period</span>
                 </div>
             `)}
             ${renderDashboardCard(`
                 <div class="flex items-center justify-between mb-2">
                     <h4 class="font-semibold text-gray-600">First Contact Resolution</h4>
                     ${Icon('CheckCircle', {className: "text-blue-500", size: 24})}
                 </div>
                 <p class="text-4xl font-bold text-gray-800">${analyticsData.firstContactResolution}<span class="text-2xl text-gray-500">%</span></p>
                 <div class="flex items-center text-sm mt-2 text-green-500">
                     ${Icon("TrendingUp", {size: 16, className: "mr-1"})}
                     <span>2% vs last period</span>
                 </div>
             `)}
             ${renderDashboardCard(`
                 <div class="flex items-center justify-between mb-2">
                     <h4 class="font-semibold text-gray-600">Customer Satisfaction</h4>
                     ${Icon('Star', {className: "text-blue-500", size: 24})}
                 </div>
                 <p class="text-4xl font-bold text-gray-800">${analyticsData.csat}<span class="text-2xl text-gray-500">%</span></p>
                 <div class="flex items-center text-sm mt-2 text-green-500">
                     ${Icon("TrendingUp", {size: 16, className: "mr-1"})}
                     <span>1.5% vs last period</span>
                 </div>
             `)}
             ${renderDashboardCard(`
                 <h4 class="font-semibold text-gray-600 mb-2">Total Tickets Resolved</h4>
                 <p class="text-4xl font-bold text-gray-800">${managerData.teamTickets.reduce((acc, t) => acc + (t.ticketsResolved || 0), 0)}</p>
             `)}
         </div>
     `;

     const leaderboard = renderDashboardCard(`
         <h3 class="font-bold text-xl mb-4 text-gray-800">Performance Leaderboard</h3>
         <div class="overflow-x-auto">
             <table class="min-w-full">
                 <thead class="border-b">
                     <tr>
                         <th class="py-2 px-4 text-left text-sm font-medium text-gray-500">Engineer</th>
                         <th class="py-2 px-4 text-left text-sm font-medium text-gray-500">Tickets Resolved</th>
                         <th class="py-2 px-4 text-left text-sm font-medium text-gray-500">Avg. Resolution (min)</th>
                         <th class="py-2 px-4 text-left text-sm font-medium text-gray-500">CSAT</th>
                     </tr>
                 </thead>
                 <tbody>
                     ${[...managerData.teamTickets].sort((a, b) => (b.ticketsResolved || 0) - (a.ticketsResolved || 0)).map((eng, index) => `
                         <tr class="border-b border-gray-100 hover:bg-gray-50">
                             <td class="py-3 px-4 font-medium text-gray-800 flex items-center">
                                 ${index === 0 ? Icon("Crown", {size: 16, className: "text-yellow-500 mr-2"}) : ''}
                                 ${index === 1 ? Icon("Star", {size: 16, className: "text-gray-400 mr-2"}) : ''}
                                 ${eng.name}
                             </td>
                             <td class="py-3 px-4 text-gray-600">${eng.ticketsResolved || 'N/A'}</td>
                             <td class="py-3 px-4 text-gray-600">${eng.avgResolutionTime || 'N/A'}</td>
                             <td class="py-3 px-4 font-semibold ${eng.csat > 95 ? 'text-green-600' : 'text-orange-500'}">${eng.csat || 'N/A'}%</td>
                         </tr>
                     `).join('')}
                 </tbody>
             </table>
         </div>
     `, 'col-span-1 lg:col-span-3');

    return `
        <div class="p-8 bg-gray-100 flex-1 space-y-8">
            <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-gray-800">Team Analytics</h1>
            </div>
            ${kpiCards}
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
                ${renderDashboardCard(`
                    <h3 class="font-bold text-xl mb-4 text-gray-800">Ticket Volume Trend</h3>
                    <div id="ticket-volume-chart" style="width: 100%; height: 300px;"></div>
                `, 'col-span-1 lg:col-span-3')}
                ${renderDashboardCard(`
                    <h3 class="font-bold text-xl mb-4 text-gray-800">Ticket Category Analysis</h3>
                    <div id="ticket-category-chart" style="width: 100%; height: 300px;"></div>
                `, 'col-span-1 lg:col-span-2')}
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
                ${leaderboard}
            </div>
        </div>
    `;
};

const renderScheduleManager = () => {
    const { managerData, currentMonth } = state;
    if (!managerData) return renderLoadingSpinner();

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const schedule = {};
    for(let day = 1; day <= daysInMonth; day++) {
        const dateString = toLocalDateString(new Date(year, month, day));
        schedule[dateString] = { Morning: [], Afternoon: [], Evening: [], Night: [], Off: [] };
        managerData.teamTickets.forEach((member, index) => {
            const shiftIndex = (day + index) % 5;
            if (shiftIndex === 0) schedule[dateString].Morning.push(member);
            else if (shiftIndex === 1) schedule[dateString].Afternoon.push(member);
            else if (shiftIndex === 2) schedule[dateString].Evening.push(member);
            else if (shiftIndex === 3) schedule[dateString].Night.push(member);
            else schedule[dateString].Off.push(member);
        });
    }

    const calendarGrid = `
        <div class="grid grid-cols-7 gap-px bg-gray-200">
            ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => `<div class="py-2 text-center font-semibold text-gray-600 bg-gray-50">${day}</div>`).join('')}
            ${blanks.map(() => `<div class="bg-gray-50"></div>`).join('')}
            ${days.map(day => {
                const dateString = toLocalDateString(new Date(year, month, day));
                const daySchedule = schedule[dateString];
                return `
                    <div class="bg-white p-2 min-h-[140px]">
                        <div class="font-bold text-right">${day}</div>
                        ${daySchedule ? `
                            <div class="space-y-1 mt-1">
                                ${Object.entries(daySchedule).map(([shift, people]) => {
                                    if (shift === 'Off' || !people || people.length === 0) return '';
                                    return `
                                        <div class="text-xs p-1 rounded ${getRoleColor(people[0].role)}">
                                            <strong>${shift}:</strong> ${people.slice(0,2).map(p=>p.name).join(', ')}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;

    return `
         <div class="p-8 bg-gray-100 flex-1">
             ${renderDashboardCard(`
                 <div class="flex justify-between items-center mb-6">
                     <button id="prev-month-btn" class="p-2 rounded-full hover:bg-gray-200">${Icon("ChevronLeft")}</button>
                     <h1 class="text-2xl font-bold text-gray-800">
                         ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                     </h1>
                     <button id="next-month-btn" class="p-2 rounded-full hover:bg-gray-200">${Icon("ChevronRight")}</button>
                 </div>
                 ${calendarGrid}
             `)}
         </div>
    `;
};

const renderEngineerSchedule = () => {
    const { engineerData, currentMonth } = state;
    if (!engineerData) return renderLoadingSpinner();

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getShiftForDay = (day) => {
        const dayOfWeek = new Date(year, month, day).getDay(); // 0 = Sun, 6 = Sat
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return 'Off';
        }
        return (day % 2 === 0) ? 'Evening' : 'Morning';
    };

    const getShiftColor = (shift) => {
        switch (shift) {
            case 'Morning': return 'bg-blue-100 text-blue-800';
            case 'Evening': return 'bg-indigo-100 text-indigo-800';
            case 'Off': return 'bg-gray-200 text-gray-700';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const calendarGrid = `
        <div class="grid grid-cols-7 gap-px bg-gray-200 border-l border-t border-gray-200">
            ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => `<div class="py-2 text-center font-semibold text-gray-600 bg-gray-50">${day}</div>`).join('')}
            ${blanks.map(() => `<div class="bg-white border-r border-b border-gray-200"></div>`).join('')}
            ${days.map(day => {
                const shift = getShiftForDay(day);
                return `
                    <div class="bg-white p-2 min-h-[120px] border-r border-b border-gray-200 flex flex-col">
                        <div class="font-bold text-right text-gray-700">${day}</div>
                        <div class="flex-grow flex items-center justify-center mt-2">
                            <span class="font-semibold text-sm px-3 py-1.5 rounded-lg ${getShiftColor(shift)}">${shift}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    return `
         <div class="p-8 bg-gray-100 flex-1">
             ${renderDashboardCard(`
                 <div class="flex justify-between items-center mb-6">
                     <button id="prev-month-btn" class="p-2 rounded-full hover:bg-gray-200">${Icon("ChevronLeft")}</button>
                     <h1 class="text-2xl font-bold text-gray-800">
                         My Schedule for ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                     </h1>
                     <button id="next-month-btn" class="p-2 rounded-full hover:bg-gray-200">${Icon("ChevronRight")}</button>
                 </div>
                 ${calendarGrid}
             `)}
         </div>
    `;
};

const renderRequestPage = () => {
    const { requestViewTab } = state;
    return `
        <div class="p-8 bg-gray-100 flex-1">
            <div class="max-w-4xl mx-auto">
                <div class="mb-6">
                    <div class="flex border-b border-gray-300">
                        <button data-tab="swap" class="request-tab-btn py-3 px-6 font-semibold ${requestViewTab === 'swap' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}">
                            Request Shift Swap
                        </button>
                        <button data-tab="leave" class="request-tab-btn py-3 px-6 font-semibold ${requestViewTab === 'leave' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}">
                            Request Leave
                        </button>
                    </div>
                </div>
                <div id="request-tab-content">
                    ${requestViewTab === 'swap' ? renderSwapRequestTab() : renderLeaveRequestTab()}
                </div>
            </div>
        </div>
    `;
};

const renderSwapRequestTab = () => {
    const upcomingShifts = [
        { date: '2025-07-16', type: 'Morning' },
        { date: '2025-07-17', type: 'Morning' },
        { date: '2025-07-18', type: 'Evening' },
    ];

    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${renderDashboardCard(`
                <h3 class="font-bold text-xl mb-4 text-gray-800">My Upcoming Shifts</h3>
                <div class="space-y-3">
                    ${upcomingShifts.map(shift => `
                        <div class="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                            <div>
                                <p class="font-bold">${new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                <p class="text-sm text-gray-600">${shift.type} Shift</p>
                            </div>
                            <button class="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-md hover:bg-blue-600">Request Swap</button>
                        </div>
                    `).join('')}
                </div>
            `)}
            ${renderDashboardCard(`
                <h3 class="font-bold text-xl mb-4 text-gray-800">Pending Requests</h3>
                <div class="space-y-3">
                    <div class="bg-yellow-50 text-yellow-800 p-3 rounded-lg">
                        <p><span class="font-bold">You requested to swap</span> your Morning shift on Jul 18 with Keerthi.</p>
                        <p class="text-sm">Status: Pending colleague approval.</p>
                    </div>
                </div>
            `)}
        </div>
    `;
};

const renderLeaveRequestTab = () => {
    const getStatusColor = (status) => {
        if (status === 'Approved') return 'bg-green-100 text-green-800';
        if (status === 'Rejected') return 'bg-red-100 text-red-800';
        return 'bg-yellow-100 text-yellow-800';
    }

    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${renderDashboardCard(`
                <h3 class="font-bold text-xl mb-4 text-gray-800">Submit a New Leave Request</h3>
                <form id="leave-request-form" class="space-y-4">
                    <div>
                        <label for="leave-type" class="block text-sm font-medium text-gray-700">Leave Type</label>
                        <select id="leave-type" name="leave-type" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option>Vacation</option>
                            <option>Sick Leave</option>
                            <option>Personal</option>
                        </select>
                    </div>
                    <div class="flex space-x-4">
                        <div class="flex-1">
                            <label for="start-date" class="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" id="start-date" name="start-date" class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2">
                        </div>
                        <div class="flex-1">
                            <label for="end-date" class="block text-sm font-medium text-gray-700">End Date</label>
                            <input type="date" id="end-date" name="end-date" class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2">
                        </div>
                    </div>
                     <div>
                        <label for="reason" class="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                        <textarea id="reason" name="reason" rows="3" class="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"></textarea>
                    </div>
                    <div>
                        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Submit Request
                        </button>
                    </div>
                </form>
            `)}
             ${renderDashboardCard(`
                <h3 class="font-bold text-xl mb-4 text-gray-800">My Request History</h3>
                <div class="space-y-3">
                    ${state.leaveRequests.length === 0 ? '<p class="text-gray-500">You have no past leave requests.</p>' :
                    state.leaveRequests.map(req => `
                        <div class="p-3 rounded-lg ${getStatusColor(req.status)}">
                            <p class="font-bold">${req.leaveType}: ${req.startDate} to ${req.endDate}</p>
                            <p class="text-sm">Status: ${req.status}</p>
                            ${req.reason ? `<p class="text-sm mt-1"><em>"${req.reason}"</em></p>` : ''}
                        </div>
                    `).join('')
                    }
                </div>
            `)}
        </div>
    `;
};

const renderPlaceholderPage = (title, iconName) => `
    <div class="p-8 bg-gray-100 flex-1 flex flex-col items-center justify-center text-center">
        <div class="bg-white p-12 rounded-2xl shadow-xl border border-gray-200/80">
            <div class="text-blue-500 mb-4">
                ${Icon(iconName, { size: 48 })}
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">${title}</h1>
            <p class="text-gray-500 max-w-md">This feature is currently under development. Our team is working hard to bring you an intuitive AI-powered experience. Stay tuned!</p>
        </div>
    </div>
`;

const renderLoadingSpinner = () => `
    <div class="w-full h-full flex-1 flex items-center justify-center">
        <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
`;

const renderMainContent = () => {
    const { view, userType, isLoading } = state;

    if (isLoading) {
        return renderLoadingSpinner();
    }

    if (userType === 'manager') {
        switch(view) {
            case 'home': return renderManagerDashboard();
            case 'roster': return renderAIRosterGenerator();
            case 'analytics': return renderTeamAnalytics();
            case 'schedule': return renderScheduleManager();
            default: return renderManagerDashboard();
        }
    } else {
         switch(view) {
            case 'home': return renderEngineerDashboard();
            case 'schedule': return renderEngineerSchedule();
            case 'request': return renderRequestPage();
            case 'performance': return renderPlaceholderPage("My Performance", "BarChart2");
            default: return renderEngineerDashboard();
        }
    }
};

const renderCharts = () => {
    if (!window.Recharts) {
        console.error("Recharts library not loaded.");
        return;
    }
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, LineChart, Line, PieChart, Pie, Cell } = window.Recharts;

    const { view, userType, managerData, engineerData } = state;

    if (userType === 'manager' && view === 'home' && managerData) {
        const teamTicketChartContainer = document.getElementById('team-ticket-chart');
        if (teamTicketChartContainer) {
            ReactDOM.render(
                React.createElement(ResponsiveContainer, { width: '100%', height: 300 },
                    React.createElement(BarChart, { data: managerData.teamTickets, margin: { top: 5, right: 20, left: -10, bottom: 5 } },
                        React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
                        React.createElement(XAxis, { dataKey: "name" }),
                        React.createElement(YAxis),
                        React.createElement(Tooltip, { wrapperClassName: "bg-white shadow-lg rounded-lg p-2" }),
                        React.createElement(Legend),
                        React.createElement(Bar, { dataKey: "serviceNow", stackId: "a", fill: "#3b82f6", name: "ServiceNow" }),
                        React.createElement(Bar, { dataKey: "jira", stackId: "a", fill: "#10b981", name: "Jira" })
                    )
                ),
                teamTicketChartContainer
            );
        }
    } else if (userType === 'manager' && view === 'analytics' && managerData) {
          const analyticsData = managerData.analytics.last30Days;
          const ticketVolumeChartContainer = document.getElementById('ticket-volume-chart');
          const ticketCategoryChartContainer = document.getElementById('ticket-category-chart');

          if(ticketVolumeChartContainer) {
              ReactDOM.render(
                  React.createElement(ResponsiveContainer, { width: "100%", height: 300 },
                      React.createElement(LineChart, { data: analyticsData.ticketVolume, margin: { top: 5, right: 20, left: -10, bottom: 5 } },
                          React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
                          React.createElement(XAxis, { dataKey: "date" }),
                          React.createElement(YAxis),
                          React.createElement(Tooltip, { contentStyle: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' } }),
                          React.createElement(Line, { type: "monotone", dataKey: "volume", stroke: "#3b82f6", strokeWidth: 2, dot: { r: 4 }, activeDot: { r: 8 } })
                      )
                  ),
                  ticketVolumeChartContainer
              );
          }
          if(ticketCategoryChartContainer) {
              ReactDOM.render(
                  React.createElement(ResponsiveContainer, { width: "100%", height: 300 },
                      React.createElement(PieChart, null,
                          React.createElement(Pie, { data: analyticsData.ticketCategories, cx: "50%", cy: "50%", outerRadius: 110, fill: "#8884d8", dataKey: "value", label: (e) => e.name },
                              analyticsData.ticketCategories.map((entry, index) => React.createElement(Cell, { key: `cell-${index}`, fill: entry.color }))
                          ),
                          React.createElement(Tooltip)
                      )
                  ),
                  ticketCategoryChartContainer
              );
          }
    }

    if (userType === 'engineer' && view === 'home' && engineerData) {
          const workloadChartContainer = document.getElementById('workload-chart');
          if(workloadChartContainer) {
              const workloadData = [{ name: 'Workload', value: engineerData.personalPulse.workload }];
              ReactDOM.render(
                  React.createElement(ResponsiveContainer, { width: '100%', height: 120 },
                      React.createElement(RadialBarChart, { innerRadius: "70%", outerRadius: "90%", data: workloadData, startAngle: 90, endAngle: -270 },
                          React.createElement(RadialBar, { minAngle: 15, background: true, clockWise: true, dataKey: 'value', cornerRadius: 10, fill: "#3b82f6" }),
                          React.createElement('text', { x: "50%", y: "50%", textAnchor: "middle", dominantBaseline: "middle", className: "text-2xl font-bold fill-gray-800" }, `${engineerData.personalPulse.workload}%`)
                      )
                  ),
                  workloadChartContainer
              );
          }
    }
};

const renderApp = () => {
    const { isLoading } = state;
    const mainContentContainer = document.createElement('div');
    mainContentContainer.className = 'flex-1 flex flex-col min-h-screen';

    const mainContentHTML = isLoading ? renderLoadingSpinner() : renderMainContent();

    mainContentContainer.innerHTML = `
        ${renderHeader()}
        <main class="flex-1 overflow-y-auto">
            ${mainContentHTML}
        </main>
    `;

    appContainer.innerHTML = '';
    appContainer.appendChild(new DOMParser().parseFromString(renderSidebar(), 'text/html').body.firstChild);
    appContainer.appendChild(mainContentContainer);

    if (!isLoading) {
        // Use a small timeout to ensure DOM is ready for charts
        setTimeout(renderCharts, 0);
    }

    attachEventListeners();
};

const attachEventListeners = () => {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            state.view = e.currentTarget.dataset.view;
            renderApp();
        });
    });

    const userTypeToggle = document.getElementById('user-type-toggle');
    const userTypeDropdown = document.getElementById('user-type-dropdown');
    if (userTypeToggle) {
        userTypeToggle.addEventListener('click', () => {
            userTypeDropdown.classList.toggle('hidden');
        });
    }

    const switchUserTypeBtn = document.getElementById('switch-user-type');
    if (switchUserTypeBtn) {
        switchUserTypeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            state.userType = state.userType === 'manager' ? 'engineer' : 'manager';
            state.view = 'home';
            userTypeDropdown.classList.add('hidden');
            renderApp();
        });
    }

    const leaveToggle = document.getElementById('leave-toggle');
    if (leaveToggle) {
        leaveToggle.addEventListener('change', (e) => {
            const newLeaveStatus = e.target.checked;
            // Update local state directly
            state.engineerData.aiAgent.isOnLeave = newLeaveStatus;
            renderApp(); // Re-render to show the change
        });
    }

    const generateRosterBtn = document.getElementById('generate-roster-btn');
    if(generateRosterBtn) {
        generateRosterBtn.addEventListener('click', handleGenerateRoster);
    }

    const prevMonthBtn = document.getElementById('prev-month-btn');
    if(prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));

    const nextMonthBtn = document.getElementById('next-month-btn');
    if(nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));

    document.querySelectorAll('.request-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            state.requestViewTab = e.currentTarget.dataset.tab;
            renderApp();
        });
    });

    const leaveForm = document.getElementById('leave-request-form');
    if (leaveForm) {
        leaveForm.addEventListener('submit', handleLeaveRequestSubmit);
    }

    // New event listener for Excel file upload
    const excelUploadInput = document.getElementById('excel-upload');
    if (excelUploadInput) {
        excelUploadInput.addEventListener('change', handleFileUpload);
    }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const fileNameDisplay = document.getElementById('file-name-display');
    fileNameDisplay.textContent = file.name;
    state.uploadedFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const employeesSheetName = 'Employees';
            if (!workbook.SheetNames.includes(employeesSheetName)) {
                throw new Error(`Excel file must contain a sheet named "${employeesSheetName}".`);
            }

            const worksheet = workbook.Sheets[employeesSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error('The "Employees" sheet is empty.');
            }

            // Validate that required columns exist
            const firstRow = jsonData[0];
            if (!('Name' in firstRow) || !('Role' in firstRow)) {
                throw new Error('The "Employees" sheet must have "Name" and "Role" columns.');
            }

            // Update state with data from Excel
            state.managerData.teamTickets = jsonData.map(row => ({
                name: row.Name,
                role: row.Role,
                serviceNow: row.ServiceNow || Math.floor(Math.random() * 10),
                jira: row.Jira || Math.floor(Math.random() * 10),
                csat: row.CSAT || (90 + Math.floor(Math.random() * 10)),
                ticketsResolved: row['Tickets Resolved'] || (10 + Math.floor(Math.random() * 10)),
                avgResolutionTime: row['Avg Resolution Time'] || (30 + Math.floor(Math.random() * 20)),
            }));

            // Update the engineer view to the first person in the list
            const firstEngineer = state.managerData.teamTickets[0];
            if(firstEngineer) {
                state.engineerData.name = firstEngineer.name;
                state.engineerData.myTickets = {
                    serviceNow: firstEngineer.serviceNow,
                    jira: firstEngineer.jira,
                };
            }

            showModal('Excel file loaded successfully!', 'info');
            renderApp(); // Re-render the whole app with new data
        } catch (error) {
            console.error("Error processing Excel file:", error);
            showModal(`Error: ${error.message}`, 'error');
            // Reset to sample data on error
            state.uploadedFileName = null;
            state.managerData = JSON.parse(JSON.stringify(initialManagerData));
            state.engineerData = JSON.parse(JSON.stringify(initialEngineerData));
            renderApp();
        }
    };
    reader.readAsArrayBuffer(file);
};

const handleGenerateRoster = async () => {
    state.isRosterLoading = true;
    state.rosterError = null;
    renderApp();

    const constraints = document.getElementById('constraints').value;
    const members = state.managerData.teamTickets;

    if (!members || members.length === 0) {
        state.rosterError = "No employee data found. Please upload an Excel file with employee details.";
        state.isRosterLoading = false;
        renderApp();
        return;
    }

    try {
        const response = await fetch('/api/generate_roster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ members, constraints }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const roster = await response.json();
        state.generatedRoster = roster;
    } catch (err) {
        state.rosterError = err.message;
    } finally {
        state.isRosterLoading = false;
        renderApp();
    }
};

const changeMonth = (offset) => {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + offset, 1);
    renderApp();
};

const handleLeaveRequestSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const leaveType = form['leave-type'].value;
    const startDate = form['start-date'].value;
    const endDate = form['end-date'].value;
    const reason = form['reason'].value;

    if (!startDate || !endDate) {
        showModal("Please select a start and end date.", 'error');
        return;
    }

    const newRequest = {
        requesterName: state.engineerData.name,
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'Pending', // In a real app, this would need manager approval
        createdAt: new Date(),
    };

    // Add to local state
    state.leaveRequests.unshift(newRequest);
    form.reset();
    showModal('Leave request submitted locally.', 'info');
    renderApp(); // Re-render to show the new request in the history
};

// --- INITIALIZATION ---
const init = () => {
    // No backend calls, just render the app with initial sample data.
    // The user will upload an Excel file to populate it with real data.
    renderApp();
};

document.addEventListener('DOMContentLoaded', init);
