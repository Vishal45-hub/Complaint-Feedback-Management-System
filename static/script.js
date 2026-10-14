// Global variables
let complaints = [];
let filteredComplaints = [];

// DOM Elements
const complaintForm = document.getElementById('complaintForm');
const complaintsList = document.getElementById('complaintsList');
const loadingElement = document.getElementById('loading');
const noComplaintsElement = document.getElementById('noComplaints');
const statusMessage = document.getElementById('statusMessage');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const clearSearchBtn = document.getElementById('clearSearch');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadComplaints();
    
    // Event Listeners
    complaintForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);
    statusFilter.addEventListener('change', handleFilter);
    clearSearchBtn.addEventListener('click', clearSearch);
});

// API Functions
async function loadComplaints() {
    try {
        showLoading();
        const response = await fetch('/api/complaints');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        complaints = await response.json();
        filteredComplaints = [...complaints];
        renderComplaints();
        hideLoading();
    } catch (error) {
        console.error('Error loading complaints:', error);
        showStatusMessage('Failed to load complaints. Please try again.', 'error');
        hideLoading();
    }
}

async function submitComplaint(complaintData) {
    try {
        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(complaintData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error submitting complaint:', error);
        throw error;
    }
}

async function updateComplaintStatus(complaintId, status) {
    try {
        const response = await fetch(`/api/complaints/${complaintId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: status })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating complaint:', error);
        throw error;
    }
}

async function deleteComplaint(complaintId) {
    try {
        const response = await fetch(`/api/complaints/${complaintId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error deleting complaint:', error);
        throw error;
    }
}

// Event Handlers
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(complaintForm);
    const complaintData = {
        name: formData.get('name').trim(),
        subject: formData.get('subject').trim(),
        message: formData.get('message').trim()
    };
    
    // Validation
    if (!complaintData.name || !complaintData.subject || !complaintData.message) {
        showStatusMessage('Please fill in all fields.', 'error');
        return;
    }
    
    if (complaintData.name.length < 2) {
        showStatusMessage('Name must be at least 2 characters long.', 'error');
        return;
    }
    
    if (complaintData.subject.length < 5) {
        showStatusMessage('Subject must be at least 5 characters long.', 'error');
        return;
    }
    
    if (complaintData.message.length < 10) {
        showStatusMessage('Message must be at least 10 characters long.', 'error');
        return;
    }
    
    try {
        // Disable form during submission
        const submitBtn = complaintForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        const result = await submitComplaint(complaintData);
        
        if (result.success) {
            // Reset form
            complaintForm.reset();
            
            // Add new complaint to the list
            complaints.unshift(result.complaint);
            filteredComplaints = [...complaints];
            renderComplaints();
            
            showStatusMessage(result.message, 'success');
        } else {
            showStatusMessage(result.message || 'Failed to submit complaint.', 'error');
        }
    } catch (error) {
        showStatusMessage('An error occurred while submitting your complaint. Please try again.', 'error');
    } finally {
        // Re-enable form
        const submitBtn = complaintForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Complaint';
    }
}

async function handleStatusUpdate(complaintId, newStatus) {
    try {
        const result = await updateComplaintStatus(complaintId, newStatus);
        
        if (result.success) {
            // Update local data
            const complaintIndex = complaints.findIndex(c => c._id === complaintId);
            if (complaintIndex !== -1) {
                complaints[complaintIndex].status = newStatus;
                filteredComplaints = [...complaints];
                renderComplaints();
            }
            
            showStatusMessage(result.message, 'success');
        } else {
            showStatusMessage(result.message || 'Failed to update complaint status.', 'error');
        }
    } catch (error) {
        showStatusMessage('An error occurred while updating the complaint. Please try again.', 'error');
    }
}

async function handleDelete(complaintId) {
    if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
        return;
    }
    
    try {
        const result = await deleteComplaint(complaintId);
        
        if (result.success) {
            // Remove from local data
            complaints = complaints.filter(c => c._id !== complaintId);
            filteredComplaints = [...complaints];
            renderComplaints();
            
            showStatusMessage(result.message, 'success');
        } else {
            showStatusMessage(result.message || 'Failed to delete complaint.', 'error');
        }
    } catch (error) {
        showStatusMessage('An error occurred while deleting the complaint. Please try again.', 'error');
    }
}

// Search and Filter Functions
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;
    
    filteredComplaints = complaints.filter(complaint => {
        const matchesSearch = complaint.name.toLowerCase().includes(searchTerm) ||
                             complaint.subject.toLowerCase().includes(searchTerm) ||
                             complaint.message.toLowerCase().includes(searchTerm);
        
        const matchesStatus = selectedStatus === 'all' || complaint.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
    });
    
    renderComplaints();
}

function handleFilter() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;
    
    filteredComplaints = complaints.filter(complaint => {
        const matchesSearch = complaint.name.toLowerCase().includes(searchTerm) ||
                             complaint.subject.toLowerCase().includes(searchTerm) ||
                             complaint.message.toLowerCase().includes(searchTerm);
        
        const matchesStatus = selectedStatus === 'all' || complaint.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
    });
    
    renderComplaints();
}

function clearSearch() {
    searchInput.value = '';
    statusFilter.value = 'all';
    filteredComplaints = [...complaints];
    renderComplaints();
}

// Rendering Functions
function renderComplaints() {
    complaintsList.innerHTML = '';
    
    if (filteredComplaints.length === 0) {
        showNoComplaints();
        return;
    }
    
    hideNoComplaints();
    
    filteredComplaints.forEach(complaint => {
        const complaintElement = createComplaintElement(complaint);
        complaintsList.appendChild(complaintElement);
    });
}

function createComplaintElement(complaint) {
    const complaintDiv = document.createElement('div');
    complaintDiv.className = 'complaint-item';
    
    const statusClass = complaint.status === 'Pending' ? 'status-pending' : 'status-resolved';
    
    complaintDiv.innerHTML = `
        <div class="complaint-header">
            <div>
                <h3 class="complaint-subject">${escapeHtml(complaint.subject)}</h3>
                <div class="complaint-meta">
                    <span><i class="fas fa-user"></i> ${escapeHtml(complaint.name)}</span>
                    <span><i class="fas fa-clock"></i> ${complaint.date}</span>
                    <span class="status-badge ${statusClass}"><i class="fas fa-circle"></i> ${complaint.status}</span>
                </div>
            </div>
            <div class="complaint-actions">
                ${complaint.status === 'Pending' ? `
                    <button class="btn btn-success" onclick="handleStatusUpdate('${complaint._id}', 'Resolved')">
                        <i class="fas fa-check"></i> Mark Resolved
                    </button>
                ` : `
                    <button class="btn btn-warning" onclick="handleStatusUpdate('${complaint._id}', 'Pending')">
                        <i class="fas fa-undo"></i> Mark Pending
                    </button>
                `}
                <button class="btn btn-danger" onclick="handleDelete('${complaint._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
        <div class="complaint-message">
            ${escapeHtml(complaint.message)}
        </div>
    `;
    
    return complaintDiv;
}

// Utility Functions
function showLoading() {
    loadingElement.style.display = 'block';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showNoComplaints() {
    noComplaintsElement.style.display = 'block';
}

function hideNoComplaints() {
    noComplaintsElement.style.display = 'none';
}

function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message show status-${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}