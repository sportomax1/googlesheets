# � Google Sheets CRUD Manager

A complete web application for managing Google Sheets data with full CRUD operations, new sheet creation, and column management - all without CORS issues!

## 📁 Files

- **`index.html`** - Complete web interface with auto-connection
- **`appscript.js`** - Google Apps Script backend (CORS-free)
- **`README.md`** - This documentation

## ✨ Features

### 📊 **Sheet Management**
- ✅ **View all sheets** in your Google Spreadsheet
- ✅ **Create new sheets** with custom headers
- ✅ **Add columns** to existing sheets (beginning or end)
- ✅ **Auto-formatted headers** with consistent styling

### 📝 **Data Operations**
- ✅ **Create records** - Add new rows to any sheet
- ✅ **Read data** - View all data in responsive tables
- ✅ **Update records** - Edit existing rows inline
- ✅ **Delete records** - Remove rows with confirmation
- ✅ **Search/Filter** - Find specific records instantly

### 🎨 **User Experience**
- ✅ **Auto-connect** - No manual URL entry required
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **Real-time updates** - Changes reflect immediately
- ✅ **Error handling** - Clear feedback for all operations
- ✅ **Professional UI** - Modern, clean interface

## 🔧 Setup Instructions

### 1. Deploy the Backend
1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Replace `Code.gs` content with `appscript.js`
4. **Important**: Update `SHEET_ID` on line 12 with your Google Sheet ID
5. Save the project
6. Deploy as Web App:
   - Click **Deploy** > **New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
7. Copy the Web App URL

### 2. Update the Frontend
1. Open `index.html` in a text editor
2. Find line 231: `let apiUrl = '...'`
3. Replace the URL with your new Web App URL
4. Save the file

### 3. Use the Application
1. Open `index.html` in any web browser
2. Wait for auto-connection (about 1 second)
3. Start managing your Google Sheets!

## 🎯 How It Works

### **CORS-Free Architecture**
- Uses **JSONP** instead of fetch() to avoid CORS issues
- All operations sent as **GET requests** with parameters
- **No preflight requests** that trigger CORS errors
- **Proven technique** that works across all browsers

### **Google Apps Script Integration**
- Handles both **JSONP callbacks** and **regular JSON** responses
- **Automatic authentication** through Google's platform
- **Real-time data access** with your Google Sheets
- **Error logging** for debugging and maintenance

## 📋 Usage Examples

### Creating a New Sheet
1. Click **"New Sheet"** in the stats panel
2. Enter sheet name: `"Customers"`
3. Enter headers: `"Name, Email, Phone, Company"`
4. Click **"Create Sheet"**

### Adding a Column
1. Switch to any sheet tab
2. Click **"Add Column"**
3. Enter column name: `"Birthday"`
4. Choose position: **"At the end"**
5. Click **"Add Column"**

### Managing Records
- **Add**: Click "Add Record" → Fill form → Save
- **Edit**: Click edit icon → Modify data → Save
- **Delete**: Click delete icon → Confirm removal
- **Search**: Type in search box → Results filter automatically

## 🔍 Troubleshooting

### Connection Issues
- Verify your Apps Script is deployed as "Web App"
- Check that access is set to "Anyone"
- Ensure the Web App URL is correct in `index.html`

### Permission Errors
- Make sure your Google account has edit access to the spreadsheet
- Re-deploy the Apps Script if you changed permissions

### Data Not Loading
- Check the `SHEET_ID` in `appscript.js` matches your spreadsheet
- Verify your spreadsheet has at least one sheet with headers

## 🎉 Success!

You now have a fully functional Google Sheets CRUD manager that:
- ❌ **No CORS issues**
- ❌ **No manual setup required**
- ❌ **No external dependencies**
- ✅ **Works immediately**
- ✅ **Professional interface**
- ✅ **Full feature set**

Happy sheet managing! 🚀