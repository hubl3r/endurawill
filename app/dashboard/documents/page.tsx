'use client';

import { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Upload, 
  Plus, 
  Search,
  ChevronRight,
  Home,
  MoreVertical,
  Download,
  Share2,
  Eye,
  Trash2,
  MessageSquare,
  Shield,
  ArrowLeft,
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string | null;
  isFolder: boolean;
  type: string;
  parentId: string | null;
  fileSize: number | null;
  fileName: string | null;
  fileType: string | null;
  createdAt: string;
  createdById: string | null;
  _count: {
    comments: number;
  };
}

interface BreadcrumbItem {
  id: string;
  name: string;
  type?: string;
}

const DEFAULT_CATEGORIES = [
  { id: 'will', name: 'Wills' },
  { id: 'vitals', name: 'Vitals' },
  { id: 'healthcare_directive', name: 'Healthcare Directives' },
  { id: 'poa', name: 'Power of Attorney' },
  { id: 'trust', name: 'Trusts' },
  { id: 'letter', name: 'Letters' },
];

export default function DocumentsPage(): JSX.Element {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'Documents' }]);
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents?tree=true');
      const data = await response.json();
      
      if (data.success && data.documents) {
        setDocuments(data.documents);
        setTenantName(data.tenant.name);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentItems = (): Document[] => {
    // Root level - show categories
    if (currentFolderId === null || currentFolderId === 'root') {
      return DEFAULT_CATEGORIES.map(cat => {
        const hasItems = documents.some(d => d.type === cat.id);
        return {
          id: `category-${cat.id}`,
          title: cat.name,
          description: null,
          isFolder: true,
          type: cat.id,
          parentId: null,
          fileSize: null,
          fileName: null,
          fileType: null,
          createdAt: new Date().toISOString(),
          createdById: null,
          _count: {
            comments: documents.filter(d => d.type === cat.id).length,
          },
        };
      }) as Document[];
    }

    // Category level - show top-level folders and files for that type
    if (currentFolderId.startsWith('category-')) {
      const docType = currentFolderId.replace('category-', '');
      return documents.filter(d => d.type === docType && d.parentId === null);
    }

    // Folder level - show contents of folder
    return documents.filter(d => d.parentId === currentFolderId);
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    
    // Update breadcrumbs
    const newBreadcrumbs = [...breadcrumbs, { id: folderId, name: folderName }];
    setBreadcrumbs(newBreadcrumbs);
  };

  const navigateToBreadcrumb = (index: number) => {
    const crumb = breadcrumbs[index];
    setCurrentFolderId(crumb.id === 'root' ? null : crumb.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const goBack = () => {
    if (breadcrumbs.length > 1) {
      navigateToBreadcrumb(breadcrumbs.length - 2);
    }
  };

  const createFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      let parentId = null;
      let documentType = 'will';

      if (currentFolderId === null || currentFolderId === 'root') {
        alert('Please select a category first');
        return;
      }

      if (currentFolderId.startsWith('category-')) {
        // Creating in a category
        parentId = null;
        documentType = currentFolderId.replace('category-', '');
      } else {
        // Creating in a folder
        const parentFolder = documents.find(d => d.id === currentFolderId);
        if (parentFolder) {
          parentId = currentFolderId;
          documentType = parentFolder.type;
        }
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: folderName,
          isFolder: true,
          parentId,
          type: documentType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchDocuments();
      } else {
        alert(data.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    );
  }

  const currentItems = getCurrentItems();
  const isRootOrCategory = currentFolderId === null || currentFolderId === 'root' || currentFolderId?.startsWith('category-');

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">Estate of {tenantName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={createFolder}
              disabled={currentFolderId === null || currentFolderId === 'root'}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              New Folder
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentFolderId === null || currentFolderId === 'root'}
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.length > 1 && (
            <button
              onClick={goBack}
              className="p-1 hover:bg-gray-100 rounded"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
          )}
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`hover:text-blue-600 ${
                  index === breadcrumbs.length - 1
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-600'
                }`}
              >
                {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {currentItems.length === 0 ? (
          <div className="text-center py-16">
            <Folder className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              This folder is empty
            </h3>
            <p className="text-gray-500 mb-4">
              Upload files or create folders to organize your documents
            </p>
            {!isRootOrCategory && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={createFolder}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                  Create Folder
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Upload className="h-4 w-4" />
                  Upload File
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {/* Folders first */}
            {currentItems
              .filter(item => item.isFolder)
              .map(item => (
                <div
                  key={item.id}
                  onClick={() => navigateToFolder(item.id, item.title)}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                >
                  <Folder className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item._count.comments} items
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}

            {/* Files */}
            {currentItems
              .filter(item => !item.isFolder)
              .map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 group"
                >
                  <File className="h-8 w-8 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    {item.fileName && (
                      <div className="text-sm text-gray-500">{item.fileName}</div>
                    )}
                    {item.description && (
                      <div className="text-sm text-gray-500 truncate mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatFileSize(item.fileSize)}</span>
                    <span>{formatDate(item.createdAt)}</span>
                    <button className="flex items-center gap-1 hover:text-blue-600">
                      <MessageSquare className="h-4 w-4" />
                      <span>{item._count.comments}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Download"
                    >
                      <Download className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Permissions"
                    >
                      <Shield className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      className="p-1 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
