# Spreadsheet Merger - React Application

A modern, client-side React application for uploading and merging multiple spreadsheets by a common column.

## Features

✨ **File Upload & Support**

- Upload multiple spreadsheets simultaneously
- Support for CSV, XLS, and XLSX formats
- Drag-and-drop interface for easy file uploads
- Header row detection with optional custom headers

📊 **Merge Functionality**

- Select a common column across all files to merge on
- Automatic detection of common columns
- Merge rows based on matching key values
- Inner join approach (only matching rows are included)

🔍 **Column Selection**

- Select which columns to include in the final output
- Quick "Select All" and "Deselect All" options
- View all available columns across all uploaded files

💾 **Export Options**

- Export merged data as CSV
- Export merged data as Excel (XLSX)
- Preview of merged data before export
- Automatic formatting and proper CSV escaping

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Navigate to the project directory:

```bash
cd excel-merge
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The compiled files will be in the `dist/` directory.

## How to Use

1. **Upload Files**: Click the upload area or drag-and-drop spreadsheet files
2. **Configure Headers**: For each file, specify whether it has headers or provide custom header names
3. **Select Merge Column**: Choose the common column to merge files on (must exist in all files)
4. **Select Output Columns**: Choose which columns to include in the final merged result
5. **Export**: Download the merged data as CSV or Excel

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Papa Parse** - CSV parsing
- **XLSX** - Excel file parsing and generation

## File Structure

```
src/
├── components/           # React components
│   ├── ColumnSelector.tsx
│   ├── FilePreview.tsx
│   ├── FileUpload.tsx
│   ├── HeaderConfiguration.tsx
│   ├── HeaderDetectionDialog.tsx
│   ├── MergeConfiguration.tsx
│   └── MergeResult.tsx
├── styles/              # Component styles
│   └── components.css
├── types/               # TypeScript interfaces
│   └── index.ts
├── utils/               # Utility functions
│   ├── mergeLogic.ts
│   └── spreadsheetParser.ts
├── App.tsx              # Main app component
├── App.css              # Main app styles
└── main.tsx             # Entry point
```

## Features in Detail

### File Upload

- Supports CSV, XLS, and XLSX file formats
- Multiple files can be uploaded at once
- Drag-and-drop support for easy file selection
- Real-time file preview showing row and column count

### Header Configuration

- Automatic detection prompts for each file
- Option to provide custom header names if file lacks headers
- Validation to ensure unique, non-empty header names

### Merge Operations

- Inner join strategy: only rows with matching keys in ALL files are included
- Automatic column conflict resolution (later files' values override earlier ones)
- Support for numeric and string keys
- Handles missing or empty values gracefully

### Export Functionality

- CSV export with proper escaping for special characters
- Excel export with formatted headers
- Data preview showing first 100 rows
- Total row count displayed for verification

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Browser Support

Modern browsers with ES2020+ support:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Known Limitations

- Large files (>100MB) may cause performance issues
- Excel files with multiple sheets only process the first sheet
- Complex data types and formulas in Excel files are converted to values
- Maximum 100 rows shown in the preview (full dataset exported)

## Future Enhancements

- [ ] Support for multiple sheet selection in Excel files
- [ ] Advanced merge options (outer join, left join, right join)
- [ ] Data transformation/mapping before merge
- [ ] Duplicate key handling strategies
- [ ] Undo/redo functionality
- [ ] File upload history
- [ ] Custom delimiter support for CSV

## License

MIT License
