import React, { useState } from 'react';
import { 
  migrateFromLocalStorage, 
  importDataToFirebase, 
  exportFirebaseData, 
  createSampleData 
} from '../utils/firebaseMigration';

const FirebaseMigrationTool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigrateFromLocalStorage = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const migrationResult = await migrateFromLocalStorage();
      setResult(migrationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSampleData = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const sampleData = createSampleData();
      const migrationResult = await importDataToFirebase(sampleData);
      setResult(migrationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sample data creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await exportFirebaseData();
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `firebase-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setResult({ message: 'Data exported successfully!', recordCount: Object.keys(data).length });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const migrationResult = await importDataToFirebase(data);
      setResult(migrationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsLoading(false);
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-light-100 dark:bg-void-900 rounded-xl shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-arcade font-bold text-gold-bright mb-4">
          🔥 Firebase Migration Tool
        </h2>
        <p className="text-neon-bright font-arcade">
          Migrate your data to Firebase Real-time Database
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Migrate from localStorage */}
        <div className="bg-light-200 dark:bg-void-800 p-6 rounded-lg">
          <h3 className="text-xl font-arcade font-bold text-gold-bright mb-4">
            📦 Migrate from localStorage
          </h3>
          <p className="text-neon-bright mb-4 text-sm">
            Transfer your existing data from browser storage to Firebase.
          </p>
          <button
            onClick={handleMigrateFromLocalStorage}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-neon-bright to-neon-glow text-void-1000 font-arcade font-bold rounded-lg hover:shadow-neon-lg transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? '⏳ Migrating...' : '🚀 Migrate Data'}
          </button>
        </div>

        {/* Create Sample Data */}
        <div className="bg-light-200 dark:bg-void-800 p-6 rounded-lg">
          <h3 className="text-xl font-arcade font-bold text-gold-bright mb-4">
            🎲 Create Sample Data
          </h3>
          <p className="text-neon-bright mb-4 text-sm">
            Add sample customers, games, and tables for testing.
          </p>
          <button
            onClick={handleCreateSampleData}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-gold-bright to-gold-glow text-void-1000 font-arcade font-bold rounded-lg hover:shadow-gold-lg transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? '⏳ Creating...' : '✨ Create Sample Data'}
          </button>
        </div>

        {/* Export Data */}
        <div className="bg-light-200 dark:bg-void-800 p-6 rounded-lg">
          <h3 className="text-xl font-arcade font-bold text-gold-bright mb-4">
            💾 Export Data
          </h3>
          <p className="text-neon-bright mb-4 text-sm">
            Download your Firebase data as a JSON file for backup.
          </p>
          <button
            onClick={handleExportData}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-arcade font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? '⏳ Exporting...' : '📥 Export Data'}
          </button>
        </div>

        {/* Import Data */}
        <div className="bg-light-200 dark:bg-void-800 p-6 rounded-lg">
          <h3 className="text-xl font-arcade font-bold text-gold-bright mb-4">
            📤 Import Data
          </h3>
          <p className="text-neon-bright mb-4 text-sm">
            Import data from a JSON file to Firebase.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImportFromFile}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-light-300 dark:bg-void-700 text-void-800 dark:text-neon-bright font-arcade rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neon-bright file:text-void-1000 file:font-arcade file:font-bold hover:file:bg-neon-glow transition-all duration-300 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Results Display */}
      {(result || error) && (
        <div className="bg-light-200 dark:bg-void-800 p-6 rounded-lg">
          <h3 className="text-xl font-arcade font-bold text-gold-bright mb-4">
            📊 Results
          </h3>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              <strong className="font-arcade">Error:</strong> {error}
            </div>
          )}
          
          {result && (
            <div className="space-y-4">
              {result.success !== undefined && (
                <div className={`border px-4 py-3 rounded ${
                  result.success 
                    ? 'bg-green-100 dark:bg-green-900/50 border-green-400 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/50 border-red-400 text-red-700 dark:text-red-300'
                }`}>
                  <strong className="font-arcade">
                    {result.success ? '✅ Success!' : '❌ Failed!'}
                  </strong>
                </div>
              )}
              
              {result.imported && (
                <div className="bg-light-300 dark:bg-void-700 p-4 rounded">
                  <h4 className="font-arcade font-bold text-gold-bright mb-2">Imported Records:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm font-arcade text-neon-bright">
                    <div>👥 Customers: {result.imported.customers}</div>
                    <div>⏱️ Sessions: {result.imported.sessions}</div>
                    <div>🎲 Games: {result.imported.games}</div>
                    <div>🏠 Tables: {result.imported.tables}</div>
                    <div>💰 Payments: {result.imported.payments}</div>
                    <div>🏷️ Promotions: {result.imported.promotions}</div>
                    <div>📋 Logs: {result.imported.activityLogs}</div>
                  </div>
                </div>
              )}
              
              {result.errors && result.errors.length > 0 && (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded">
                  <h4 className="font-arcade font-bold mb-2">⚠️ Warnings:</h4>
                  <ul className="text-sm space-y-1">
                    {result.errors.map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.message && (
                <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-400 text-blue-700 dark:text-blue-300 px-4 py-3 rounded">
                  <strong className="font-arcade">ℹ️ Info:</strong> {result.message}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-light-200 dark:bg-void-800 p-6 rounded-lg">
        <h3 className="text-xl font-arcade font-bold text-gold-bright mb-4">
          📖 Instructions
        </h3>
        <div className="space-y-3 text-neon-bright font-arcade text-sm">
          <div>
            <strong className="text-gold-bright">1. First Time Setup:</strong> 
            Use "Create Sample Data" to add test data to your Firebase database.
          </div>
          <div>
            <strong className="text-gold-bright">2. Migration:</strong> 
            If you have existing data in localStorage, use "Migrate from localStorage".
          </div>
          <div>
            <strong className="text-gold-bright">3. Backup:</strong> 
            Use "Export Data" to download your Firebase data as backup.
          </div>
          <div>
            <strong className="text-gold-bright">4. Restore:</strong> 
            Use "Import Data" to restore from a previously exported JSON file.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseMigrationTool;
