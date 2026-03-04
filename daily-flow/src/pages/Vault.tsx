/**
 * Vault Page — Sprint 22 P7
 *
 * File browser UI for the Knowledge Vault.
 * Renders the vault folder tree with expand/collapse, breadcrumb
 * navigation, and entity linking (click a file → navigate to entity).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Search,
  HardDrive,
  BookOpen,
  Inbox,
  Library,
  Briefcase,
  Hash,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useVault } from '@/lib/adapters/provider';
import type { VaultNode } from '@/lib/vault/types';
import { VAULT_FOLDERS } from '@/lib/vault/types';

// ─── Helpers ───

/** Get icon for a root-level vault folder */
function getFolderIcon(name: string) {
  switch (name) {
    case VAULT_FOLDERS.TOPICS:
      return Hash;
    case VAULT_FOLDERS.PROJECTS:
      return Briefcase;
    case VAULT_FOLDERS.JOURNAL:
      return BookOpen;
    case VAULT_FOLDERS.LIBRARY:
      return Library;
    case VAULT_FOLDERS.INBOX:
      return Inbox;
    default:
      return Folder;
  }
}

/** Get the navigation path for an entity ref */
function getEntityRoute(node: VaultNode): string | null {
  if (!node.entityRef) return null;
  const { type, id, parentId } = node.entityRef;
  switch (type) {
    case 'journal': {
      const dateMatch = node.name.match(/^(\d{4}-\d{2}-\d{2})/);
      return dateMatch ? `/notes?date=${dateMatch[1]}` : '/notes';
    }
    case 'capture': {
      const captureDateMatch = node.name.match(/^capture-(\d{4}-\d{2}-\d{2})/);
      return captureDateMatch ? `/notes?date=${captureDateMatch[1]}` : '/notes';
    }
    case 'topic':
      return `/topics/${id}`;
    case 'topic_page':
      return parentId ? `/topics/${parentId}/pages/${id}` : `/topics/${id}`;
    case 'project':
      return `/projects/${id}`;
    case 'project_note':
      return parentId ? `/projects/${parentId}` : '/projects';
    default:
      return null;
  }
}

/** Count all files (non-directory) in a tree */
function countFiles(node: VaultNode): number {
  if (!node.isDirectory) return 1;
  return (node.children ?? []).reduce((sum, c) => sum + countFiles(c), 0);
}

/** Count all folders (directory) in a tree */
function countFolders(node: VaultNode): number {
  if (!node.isDirectory) return 0;
  return 1 + (node.children ?? []).reduce((sum, c) => sum + countFolders(c), 0);
}

/** Check if a node or any descendant matches the search query */
function matchesSearch(node: VaultNode, query: string): boolean {
  if (node.name.toLowerCase().includes(query)) return true;
  return (node.children ?? []).some((c) => matchesSearch(c, query));
}

// ─── Tree Node Component ───

interface TreeNodeProps {
  node: VaultNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onNavigate: (node: VaultNode) => void;
  searchQuery: string;
  level: number;
  posinset: number;
  setsize: number;
  focusedPath: string;
  onFocusChange: (path: string) => void;
}

function TreeNode({
  node,
  depth,
  expanded,
  onToggle,
  onNavigate,
  searchQuery,
  level,
  posinset,
  setsize,
  focusedPath,
  onFocusChange,
}: TreeNodeProps) {
  const isExpanded = expanded.has(node.path);
  const hasChildren = node.isDirectory && (node.children?.length ?? 0) > 0;

  // Filter children by search query
  const visibleChildren = searchQuery
    ? (node.children ?? []).filter((c) => matchesSearch(c, searchQuery))
    : (node.children ?? []);

  const isRootFolder = depth === 0;
  const FolderIcon = isRootFolder ? getFolderIcon(node.name) : isExpanded ? FolderOpen : Folder;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const tree = e.currentTarget.closest('[role="tree"]');
    if (!tree) return;
    const items = Array.from(tree.querySelectorAll<HTMLElement>('[data-tree-item]'));
    const idx = items.indexOf(e.currentTarget);
    if (idx === -1) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        items[idx + 1]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[idx - 1]?.focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (node.isDirectory && !isExpanded) {
          onToggle(node.path);
        } else if (isExpanded) {
          items[idx + 1]?.focus();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (node.isDirectory && isExpanded) {
          onToggle(node.path);
        }
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  };

  return (
    <div>
      <button
        role="treeitem"
        onClick={() => {
          if (node.isDirectory) {
            onToggle(node.path);
          } else {
            onNavigate(node);
          }
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => onFocusChange(node.path)}
        className="group -mx-2 flex w-[calc(100%+16px)] items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        tabIndex={node.path === focusedPath ? 0 : -1}
        aria-expanded={node.isDirectory ? isExpanded : undefined}
        aria-level={level}
        aria-setsize={setsize}
        aria-posinset={posinset}
        aria-label={node.isDirectory ? `${isExpanded ? 'Collapse' : 'Expand'} ${node.name} folder` : node.name}
        data-tree-item
      >
        {/* Expand/collapse chevron */}
        {node.isDirectory ? (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )
            ) : null}
          </span>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}

        {/* Icon */}
        {node.isDirectory ? (
          <FolderIcon className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-info-foreground" />
        )}

        {/* Name */}
        <span className={`truncate text-sm ${node.isDirectory ? 'font-medium text-foreground' : 'text-foreground'}`}>
          {node.name}
        </span>

        {/* File count for folders */}
        {node.isDirectory && (node.children?.length ?? 0) > 0 && (
          <span className="ml-auto text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {node.children?.length}
          </span>
        )}
      </button>

      {/* Children */}
      {node.isDirectory && isExpanded && visibleChildren.length > 0 && (
        <div role="group">
          {visibleChildren.map((child, index) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              level={level + 1}
              posinset={index + 1}
              setsize={visibleChildren.length}
              expanded={expanded}
              onToggle={onToggle}
              onNavigate={onNavigate}
              searchQuery={searchQuery}
              focusedPath={focusedPath}
              onFocusChange={onFocusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vault Page ───

const Vault = () => {
  const navigate = useNavigate();
  const vaultAdapter = useVault();
  const [tree, setTree] = useState<VaultNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set([
      VAULT_FOLDERS.TOPICS,
      VAULT_FOLDERS.PROJECTS,
      VAULT_FOLDERS.JOURNAL,
      VAULT_FOLDERS.LIBRARY,
      VAULT_FOLDERS.INBOX,
    ]),
  );
  const [currentPath, setCurrentPath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focusedPath, setFocusedPath] = useState('');

  // Load tree from vault adapter
  useEffect(() => {
    if (!vaultAdapter) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    vaultAdapter
      .getTree()
      .then((t) => {
        if (!cancelled) {
          setTree(t);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error('[Vault] Failed to load tree:', e);
          setError(e instanceof Error ? e.message : 'Failed to load vault');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [vaultAdapter]);

  const toggleNode = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleNodeClick = useCallback(
    (node: VaultNode) => {
      const route = getEntityRoute(node);
      if (route) {
        navigate(route);
      }
    },
    [navigate],
  );

  // Auto-expand folders that match search
  useEffect(() => {
    if (!searchQuery || !tree) return;
    const query = searchQuery.toLowerCase();
    const toExpand = new Set(expanded);

    function expandMatching(node: VaultNode) {
      if (node.isDirectory && matchesSearch(node, query)) {
        toExpand.add(node.path);
        (node.children ?? []).forEach(expandMatching);
      }
    }
    expandMatching(tree);
    setExpanded(toExpand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Build breadcrumb segments from currentPath
  const breadcrumbSegments = currentPath ? currentPath.split('/') : [];

  // Stats (memoized to avoid re-traversing the tree on every render)
  const totalFiles = useMemo(() => (tree ? countFiles(tree) : 0), [tree]);
  const totalFolders = useMemo(() => (tree ? countFolders(tree) - 1 : 0), [tree]); // exclude root

  // Find current subtree for breadcrumb navigation
  const currentNode =
    currentPath && tree
      ? (() => {
          let node = tree;
          for (const segment of currentPath.split('/')) {
            const child = node.children?.find((c) => c.name === segment);
            if (!child) return tree;
            node = child;
          }
          return node;
        })()
      : tree;

  // Set initial focused path when tree loads
  useEffect(() => {
    if (currentNode?.children?.length && !focusedPath) {
      setFocusedPath(currentNode.children[0].path);
    }
  }, [currentNode, focusedPath]);

  // Visible root children (filtered by search)
  const visibleRootChildren = useMemo(() => {
    if (!currentNode?.children) return [];
    if (searchQuery) {
      return currentNode.children.filter((c) => matchesSearch(c, searchQuery.toLowerCase()));
    }
    return currentNode.children;
  }, [currentNode, searchQuery]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
              <HardDrive className="h-6 w-6" />
              Vault
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalFolders} folder{totalFolders !== 1 ? 's' : ''}, {totalFiles} file
              {totalFiles !== 1 ? 's' : ''}
            </p>
          </div>
        </header>

        {/* Breadcrumbs */}
        {currentPath && (
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer" onClick={() => setCurrentPath('')}>
                  Vault
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbSegments.map((segment, i) => {
                const isLast = i === breadcrumbSegments.length - 1;
                const segmentPath = breadcrumbSegments.slice(0, i + 1).join('/');
                return (
                  <span key={segmentPath} className="contents">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{segment}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink className="cursor-pointer" onClick={() => setCurrentPath(segmentPath)}>
                          {segment}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vault..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search vault"
          />
        </div>

        {/* File Tree */}
        <div className="widget-card">
          {loading ? (
            <div className="space-y-3 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className={`h-4 rounded ${i % 2 === 0 ? 'w-32' : 'w-48'}`} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <HardDrive className="mx-auto mb-4 h-12 w-12 text-destructive/30" />
              <h3 className="mb-2 text-lg font-medium text-foreground">Failed to load vault</h3>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">{error}</p>
            </div>
          ) : !tree || !currentNode ? (
            <div className="py-12 text-center">
              <HardDrive className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-medium text-foreground">Vault not available</h3>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">Sign in to access your Knowledge Vault.</p>
            </div>
          ) : visibleRootChildren.length > 0 ? (
            <div role="tree" aria-label="Vault files" className="space-y-0.5">
              {visibleRootChildren.map((child, index) => (
                <TreeNode
                  key={child.path}
                  node={child}
                  depth={0}
                  level={1}
                  posinset={index + 1}
                  setsize={visibleRootChildren.length}
                  expanded={expanded}
                  onToggle={toggleNode}
                  onNavigate={handleNodeClick}
                  searchQuery={searchQuery.toLowerCase()}
                  focusedPath={focusedPath}
                  onFocusChange={setFocusedPath}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                {searchQuery ? 'No results found' : 'Empty vault'}
              </h3>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Your vault will populate as you create journal entries, topics, and captures.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Vault;
