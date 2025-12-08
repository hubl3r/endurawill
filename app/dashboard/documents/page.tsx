'use client';

import { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  Upload, 
  Plus, 
  Search,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Download,
  Share2,
  Eye,
  Trash2,
  MessageSquare,
  Shield,
  FileText,
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string | null;
  isFolder: boolean;
  type: string; // Changed from documentType
  parentId: string | null;
  fileSize: number | null;
  fileName: string | null;
  fileType: string | null;
  createdAt: string;
  createdById: string | null; // Changed from uploadedById
  _count: {
    comments: number;
  };
}

interface FolderNode extends Document {
  children: FolderNode[];
  isExpanded?: boolean;
}

const DEFAULT_CATEGORIES = [
  { id: 'will', name: 'Wills', icon: FileText },
  { id: 'vitals', name: 'Vitals', icon: Shield },
  { id: 'healthcare_directive', name: 'Healthcare', icon: FileText },
  { id: 'poa', name: 'Power of Attorney', icon: FileText },
  { id: 'trust', name: 'Trusts', icon: FileText },
  { id: 'letter', name: 'Letters', icon: FileText },
];

export default function DocumentsPage(): JSX.Element {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folderTree, setFolderTree] = useState<FolderNode[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

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
        buildFolderTree(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildFolderTree = (docs: Document[]) => {
    // Create root level categories
    const rootCategories: FolderNode[] = DEFAULT_CATEGORIES.map(cat => {
      const existingCategory = docs.find(
        d => d.isFolder && d.parentId === null && d.type === cat.id
      );
      
      return {
        id: existingCategory?.id || `category-${cat.id}`,
        title: existingCategory?.title || cat.name,
        description: null,
        isFolder: true,
        type: cat.id,
        parentId: null,
        fileSize: null,
        fileName: null,
        fileType: null,
        createdAt: existingCategory?.createdAt || new Date().toISOString(),
        createdById: existingCategory?.createdById || null,
        _count: { comments: 0 },
        children: [],
        isExpanded: false,
      };
    });

    // Build nested structure
    const buildChildren = (parentId: string): FolderNode[] => {
      return docs
        .filter(d => d.parentId === parentId && d.isFolder)
        .map(d => ({
          ...d,
          children: buildChildren(d.id),
          isExpanded: false,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    // Add children to each category
    rootCategories.forEach(category => {
      if (category.id.startsWith('category-')) {
        // Virtual category, find its children
        category.children = docs
          .filter(d => d.parentId === null && d.isFolder && d.type === category.type)
          .map(d => ({
            ...d,
            children: buildChildren(d.id),
            isExpanded: false,
          }));
      } else {
        // Real folder
        category.children = buildChildren(category.id);
      }
    });

    setFolderTree(rootCategories);
  };

  const toggleFolder = (folderId: string) => {
    const updateTree = (nodes: FolderNode[]): FolderNode[] => {
      return nodes.map(node => {
        if (node.id === folderId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };

    setFolderTree(updateTree(folderTree));
  };

  const selectFolder = (folderId: string) => {
    setSelectedFolder(folderId);
  };

  const getFilesInFolder = (folderId: string | null): Document[] => {
    if (!folderId) return [];
    
    // Handle virtual categories
    if (folderId.startsWith('category-')) {
      const docType = folderId.replace('category-', '');
      return documents.filter(
        d => !d.isFolder && d.type === docType && d.parentId === null
      );
    }
    
    return documents.filter(d => !d.isFolder && d.parentId === folderId);
  };

  const createFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: folderName,
          isFolder: true,
          parentId: selectedFolder?.startsWith('category-') ? null : selectedFolder,
          type: selectedFolder?.startsWith('category-') 
            ? selectedFolder.replace('category-', '') 
            : documents.find(d => d.id === selectedFolder)?.type || 'will',
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
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

  const renderFolderTree = (nodes: FolderNode[], level: number = 0) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer ${
            selectedFolder === node.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
          onClick={() => {
            selectFolder(node.id);
            toggleFolder(node.id);
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(node.id);
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {node.isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {node.isExpanded ? (
            <FolderOpen className="h-5 w-5 text-blue-500" />
          ) : (
            <Folder className="h-5 w-5 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-700">{node.title}</span>
          {!node.id.startsWith('category-') && (
            <span className="text-xs text-gray-400 ml-auto">
              {documents.filter(d => d.parentId === node.id).length}
            </span>
          )}
        </div>
        {node.isExpanded && node.children.length > 0 && renderFolderTree(node.children, level + 1)}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    );
  }

  const filesInSelectedFolder = selectedFolder ? getFilesInFolder(selectedFolder) : [];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">Estate of {tenantName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={createFolder}
              disabled={!selectedFolder}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              New Folder
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={!selectedFolder}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Folder Tree */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="max-h-64 overflow-y-auto">
            {folderTree.length > 0 ? (
              renderFolderTree(folderTree)
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Folder className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No folders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-auto p-6">
          {!selectedFolder ? (
            <div className="text-center py-16">
              <Folder className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a folder to view its contents
              </h3>
              <p className="text-gray-500">
                Choose a folder from the tree above to see files and subfolders
              </p>
            </div>
          ) : filesInSelectedFolder.length === 0 ? (
            <div className="text-center py-16">
              <File className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                This folder is empty
              </h3>
              <p className="text-gray-500 mb-4">
                Upload files or create subfolders to organize your documents
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={createFolder}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                  Create Folder
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filesInSelectedFolder.map(file => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <File className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.title}
                            </div>
                            {file.fileName && (
                              <div className="text-xs text-gray-500">{file.fileName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {file.description || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                          <MessageSquare className="h-4 w-4" />
                          <span>{file._count.comments}</span>
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Download"
                          >
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
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
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
