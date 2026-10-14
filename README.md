# Complaint / Feedback Management System

A modern, professional web application for managing complaints and feedback submissions. Perfect for college complaint portals or any organization that needs to track and manage user feedback.

## Features

### ✅ Core Functionality
- **Submit Complaints**: Users can submit complaints with name, subject, and detailed message
- **View All Complaints**: Real-time listing of all complaints sorted by date (newest first)
- **Update Status**: Admin can mark complaints as "Pending" or "Resolved"
- **Delete Complaints**: Remove complaints that are no longer relevant
- **AJAX Support**: No page reloads - smooth user experience

### ✅ Technical Features
- **Flask Backend**: RESTful API with MongoDB integration
- **File-based Fallback**: Works even without MongoDB running
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Instant feedback on all operations
- **Input Validation**: Client and server-side validation
- **Search & Filter**: Find complaints by text or filter by status

## Installation

### Prerequisites
- Python 3.8+
- MongoDB (optional - app works without it using file storage)

### Setup Instructions

1. **Clone or download the project files**
2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the application:**
   ```bash
   python app.py
   ```
4. **Open your browser and navigate to:**
   - http://127.0.0.1:5000
   - Or http://localhost:5000

## Project Structure

```
CFMS/
├── app.py              # Flask backend application
├── requirements.txt    # Python dependencies
├── README.md          # This documentation
├── templates/
│   └── index.html     # Main HTML template
└── static/
    ├── style.css      # CSS styling
    └── script.js      # JavaScript functionality
```

## Usage

### Submitting a Complaint
1. Fill in your name, subject, and message
2. Click "Submit Complaint"
3. The complaint appears instantly in the list

### Managing Complaints (Admin)
1. **Update Status**: Click "Mark Resolved" or "Mark Pending" to change status
2. **Delete**: Click "Delete" to remove a complaint
3. **Search**: Use the search box to find specific complaints
4. **Filter**: Use the dropdown to show only Pending or Resolved complaints

### Data Storage

The system automatically tries to use MongoDB for data storage. If MongoDB is not available, it falls back to a local JSON file (`complaints.json`) to ensure the application still works.

## API Endpoints

- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Submit new complaint
- `PUT /api/complaints/<id>` - Update complaint status
- `DELETE /api/complaints/<id>` - Delete complaint

## Technologies Used

- **Backend**: Flask (Python)
- **Database**: MongoDB (with file-based fallback)
- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Custom CSS with FontAwesome icons
- **AJAX**: Native JavaScript Fetch API

## Troubleshooting

### MongoDB Connection Issues
If MongoDB is not running, the app will automatically use file-based storage. You'll see a message in the console indicating this fallback.

### Port Already in Use
If port 5000 is occupied, modify the `app.run()` call in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change to desired port
```

### Dependencies Issues
Ensure you have the latest version of pip and install dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## Screenshots

The application features:
- Clean, professional interface
- Responsive design that works on mobile devices
- Real-time complaint listing
- Status indicators for Pending/Resolved complaints
- Search and filter functionality

## Development

This project was designed to be:
- **Easy to understand**: Clean code structure
- **Easy to modify**: Well-commented code
- **Professional**: Production-ready interface
- **Robust**: Error handling and fallback systems

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure all dependencies are installed
3. Verify MongoDB is running (if using MongoDB storage)
4. Check the browser console for JavaScript errors