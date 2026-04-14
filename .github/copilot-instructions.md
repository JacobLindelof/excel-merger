<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Spreadsheet Merger - Development Instructions

## Project Overview

This is a React TypeScript application for uploading and merging multiple spreadsheets (CSV, XLS, XLSX) by selecting a common column. Users can configure headers, select merge columns, choose output columns, and export merged data.

## Architecture

### Components Structure

- **FileUpload**: Drag-and-drop file upload with support for CSV, XLS, XLSX
- **FilePreview**: Display uploaded files with row/column counts and headers
- **MergeConfiguration**: Select merge column and output columns
- **HeaderDetectionDialog**: Modal for prompting header detection
- **HeaderConfiguration**: Modal for configuring custom headers when files lack them
- **ColumnSelector**: Checkboxes for selecting output columns
- **MergeResult**: Display merged data preview and export options

### Utilities

- **spreadsheetParser.ts**: File parsing (CSV with Papa Parse, Excel with XLSX)
- **mergeLogic.ts**: Data merging, CSV/Excel export functionality
- **types/index.ts**: TypeScript interfaces (SpreadsheetFile, MergeConfig)

## Development Guidelines

### Code Style

- Use TypeScript strictly with type safety
- Use type-only imports: `import type { TypeName } from './module'`
- Components are functional with React hooks
- Prefer const over let

### File Handling

- Support CSV, XLS, XLSX file formats only
- Handle header detection dialog for each file sequentially
- For files without headers, prompt user to provide custom header names
- Use inner join approach (only matching rows across all files)

### State Management

- Main app state managed in App.tsx using React hooks
- Three main states: 'upload', 'configuring-headers', 'merging', 'result'
- Sequential processing of files with header detection

### Styling

- Components styled in `src/styles/components.css`
- Main app styles in `src/App.css`
- Responsive design for mobile (768px breakpoint)
- Use CSS variables for colors and spacing

## Key Features to Maintain

1. **File Upload**: Support drag-drop and click upload for multiple files
2. **Header Detection**: Prompt for each file asking if it has headers
3. **Custom Headers**: Allow users to name columns when files lack headers
4. **Common Column Detection**: Auto-detect and list common columns
5. **Column Selection**: Checkboxes for selecting output columns
6. **Merge Strategy**: Inner join - only rows with keys in all files
7. **Export**: CSV and Excel export with proper formatting
8. **Data Preview**: Show first 100 rows of merged result

## Common Tasks

### Adding New Component

1. Create component in `src/components/`
2. Export as named export
3. Add styling to `src/styles/components.css`
4. Import and use in appropriate parent component
5. Add TypeScript interfaces if needed

### Modifying Merge Logic

- Edit `src/utils/mergeLogic.ts`
- Test with sample CSV/Excel files
- Ensure proper handling of missing values
- Validate CSV export escaping

### Updating Styles

- Modify `src/styles/components.css` for component styles
- Modify `src/App.css` for app-level styles
- Test responsive design at 768px and 480px breakpoints

## Dependencies

- **papaparse**: CSV parsing
- **xlsx**: Excel file reading (also used for writing)
- **file-saver**: (if used, currently using native Blob API)
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool

## Build & Run Commands

- `npm install`: Install dependencies
- `npm run dev`: Start dev server (Vite)
- `npm run build`: Build for production (TypeScript + Vite)
- `npm run preview`: Preview production build

## Known Issues & Limitations

- Large files (>100MB) may cause performance issues
- Only processes first sheet in multi-sheet Excel files
- Maximum 100 rows shown in preview (full dataset exported)
- No support for complex Excel formulas/data types

## Testing Suggestions

- Test with CSV files with/without headers
- Test with XLS and XLSX files
- Test with different column names and data types
- Verify merge with numeric and string keys
- Test CSV export with special characters (quotes, commas, newlines)
- Test export with large datasets (>1000 rows)

## Performance Considerations

- File parsing is done client-side (no server needed)
- Large files may freeze UI during parsing
- Consider workers for large file parsing in future
- Preview limited to 100 rows to avoid rendering performance issues

## Future Enhancements

- Support for multiple Excel sheets
- Left/Right/Full outer join options
- Data transformation before merge
- Undo/redo functionality
- File upload history
- Advanced duplicate handling
