import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  Description as FileIcon,
} from "@mui/icons-material";

export interface DownloadedFile {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: DownloadedFile[];
}

interface DownloadedFilesTreeProps {
  files: DownloadedFile[];
  title?: string;
}

const DownloadedFilesTree: React.FC<DownloadedFilesTreeProps> = ({
  files,
  title = "Downloaded Files",
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderFileItem = (file: DownloadedFile, level: number = 0, itemId: string) => {
    const isExpanded = expandedItems.has(itemId);
    const hasChildren = file.children && file.children.length > 0;

    return (
      <React.Fragment key={itemId}>
        <ListItem
          sx={{
            pl: 2 + level * 2,
            py: 0.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => toggleExpanded(itemId)}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mr: 1,
                p: 0.5,
              }}
            >
              {isExpanded ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 24, mr: 1 }} />}
          <ListItemIcon sx={{ minWidth: 32 }}>
            {file.type === 'folder' ? (
              <FolderIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' }} />
            ) : (
              <FileIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' }} />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ color: 'white' }}>
                {file.name}
              </Typography>
            }
          />
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {file.children?.map((child, index) =>
                renderFileItem(child, level + 1, `${itemId}-${index}`)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  if (files.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          No files downloaded yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Box
        sx={{
          maxHeight: '300px',
          overflow: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <List dense>
          {files.map((file, index) => renderFileItem(file, 0, `root-${index}`))}
        </List>
      </Box>
    </Box>
  );
};

export default DownloadedFilesTree;
