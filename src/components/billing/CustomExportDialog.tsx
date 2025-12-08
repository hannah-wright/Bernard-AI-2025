/**
 * Custom Export Dialog
 * 
 * Allows users to select which columns to export and save export templates.
 * Features: Column selection, templates, preview, format options.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  Save,
  Trash2,
  Star,
  FileSpreadsheet,
  Loader2,
  Check,
  Plus,
  Eye,
  FileText,
  Sheet,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import {
  useExportTemplates,
  EXPORT_COLUMNS,
  getColumnsByCategory,
  DEFAULT_EXPORT_COLUMNS,
  ExportTemplate,
} from '@/hooks/useExportTemplates';
import { Startup } from '@/types/startup';
import { toast } from 'sonner';

type ExportFormat = 'csv' | 'tsv';

interface CustomExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  startups: Startup[];
  onExport: (columns: string[], format?: ExportFormat) => void;
  getColumnValue?: (startup: Startup, key: string) => string;
}

export const CustomExportDialog = ({
  isOpen,
  onClose,
  startups,
  onExport,
  getColumnValue,
}: CustomExportDialogProps) => {
  const {
    templates,
    isLoading,
    defaultTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useExportTemplates();

  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(DEFAULT_EXPORT_COLUMNS)
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'columns' | 'preview'>('columns');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [copied, setCopied] = useState(false);

  const columnsByCategory = getColumnsByCategory();
  const categories = Object.keys(columnsByCategory);

  // Preview data - show first 5 startups
  const previewData = useMemo(() => {
    if (!getColumnValue) return [];
    return startups.slice(0, 5).map(startup => {
      const row: Record<string, string> = {};
      Array.from(selectedColumns).forEach(key => {
        row[key] = getColumnValue(startup, key);
      });
      return row;
    });
  }, [startups, selectedColumns, getColumnValue]);

  // Get column label with (Est) suffix if applicable
  const getColumnLabel = (key: string) => {
    const col = EXPORT_COLUMNS.find(c => c.key === key);
    if (!col) return key;
    return col.isEstimated ? `${col.label} (Est)` : col.label;
  };

  // Load default template on mount
  useEffect(() => {
    if (defaultTemplate && !selectedTemplateId) {
      setSelectedColumns(new Set(defaultTemplate.columns));
      setSelectedTemplateId(defaultTemplate.id);
    }
  }, [defaultTemplate, selectedTemplateId]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'new') {
      setSelectedColumns(new Set(DEFAULT_EXPORT_COLUMNS));
      setSelectedTemplateId('');
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedColumns(new Set(template.columns));
      setSelectedTemplateId(templateId);
    }
  };

  // Toggle column selection
  const toggleColumn = (columnKey: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(columnKey)) {
      newSelected.delete(columnKey);
    } else {
      newSelected.add(columnKey);
    }
    setSelectedColumns(newSelected);
  };

  // Toggle all columns in a category
  const toggleCategory = (category: string) => {
    const categoryColumns = columnsByCategory[category];
    const allSelected = categoryColumns.every(col => selectedColumns.has(col.key));
    
    const newSelected = new Set(selectedColumns);
    categoryColumns.forEach(col => {
      if (allSelected) {
        newSelected.delete(col.key);
      } else {
        newSelected.add(col.key);
      }
    });
    setSelectedColumns(newSelected);
  };

  // Select all columns
  const selectAll = () => {
    setSelectedColumns(new Set(EXPORT_COLUMNS.map(c => c.key)));
  };

  // Clear all columns
  const clearAll = () => {
    setSelectedColumns(new Set());
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (selectedColumns.size === 0) {
      toast.error('Please select at least one column');
      return;
    }

    await createTemplate.mutateAsync({
      name: templateName.trim(),
      description: templateDescription.trim() || undefined,
      columns: Array.from(selectedColumns),
      isDefault: setAsDefault,
    });

    setShowSaveDialog(false);
    setTemplateName('');
    setTemplateDescription('');
    setSetAsDefault(false);
  };

  // Update existing template
  const handleUpdateTemplate = async () => {
    if (!selectedTemplateId) return;

    await updateTemplate.mutateAsync({
      id: selectedTemplateId,
      columns: Array.from(selectedColumns),
    });
  };

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    await deleteTemplate.mutateAsync(templateId);
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId('');
      setSelectedColumns(new Set(DEFAULT_EXPORT_COLUMNS));
    }
  };

  // Set template as default
  const handleSetDefault = async (templateId: string) => {
    await updateTemplate.mutateAsync({
      id: templateId,
      isDefault: true,
    });
  };

  // Export with selected columns
  const handleExport = async () => {
    if (selectedColumns.size === 0) {
      toast.error('Please select at least one column');
      return;
    }

    setIsExporting(true);
    try {
      await onExport(Array.from(selectedColumns), exportFormat);
      toast.success('Export complete!', {
        description: `${startups.length} startups exported as ${exportFormat.toUpperCase()}`,
      });
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  // Copy preview to clipboard
  const copyToClipboard = async () => {
    if (!getColumnValue || selectedColumns.size === 0) return;
    
    const headers = Array.from(selectedColumns).map(getColumnLabel).join('\t');
    const rows = startups.map(s => 
      Array.from(selectedColumns).map(key => getColumnValue(s, key)).join('\t')
    ).join('\n');
    
    await navigator.clipboard.writeText(`${headers}\n${rows}`);
    setCopied(true);
    toast.success('Copied to clipboard!', {
      description: 'Paste directly into Excel or Google Sheets',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const hasChanges = selectedTemplate && 
    JSON.stringify([...selectedColumns].sort()) !== JSON.stringify([...selectedTemplate.columns].sort());

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Export Startups
            </DialogTitle>
            <DialogDescription>
              Customize your export with specific columns and save templates for future use.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'columns' | 'preview')}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="columns" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Select Columns
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2" disabled={selectedColumns.size === 0}>
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              {/* Format & Template Selection */}
              <div className="flex items-center gap-2">
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CSV
                      </span>
                    </SelectItem>
                    <SelectItem value="tsv">
                      <span className="flex items-center gap-2">
                        <Sheet className="h-4 w-4" />
                        TSV
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="columns" className="space-y-4 mt-0">
              {/* Template Selector */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Load Template</Label>
                  <Select value={selectedTemplateId || 'new'} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          New Export
                        </span>
                      </SelectItem>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <span className="flex items-center gap-2">
                            {template.isDefault && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                            {template.name}
                            <Badge variant="secondary" className="text-xs">
                              {template.columns.length} cols
                            </Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    disabled={selectedColumns.size === 0}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  {selectedTemplateId && hasChanges && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdateTemplate}
                      disabled={updateTemplate.isPending}
                    >
                      {updateTemplate.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Update
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Quick:</span>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={selectAll}>
                  Select All
                </Button>
                <span className="text-muted-foreground">|</span>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={clearAll}>
                  Clear All
                </Button>
                <span className="ml-auto text-muted-foreground">
                  {selectedColumns.size} of {EXPORT_COLUMNS.length} columns selected
                </span>
              </div>

              <Separator />

              {/* Column Selection */}
              <ScrollArea className="h-[350px] pr-4">
                <Accordion type="multiple" defaultValue={categories} className="space-y-2">
                  {categories.map(category => {
                    const cols = columnsByCategory[category];
                    const selectedInCategory = cols.filter(c => selectedColumns.has(c.key)).length;
                    const allSelected = selectedInCategory === cols.length;
                    const someSelected = selectedInCategory > 0 && !allSelected;

                    return (
                      <AccordionItem key={category} value={category} className="border rounded-lg px-3">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3 w-full">
                            <Checkbox
                              checked={allSelected}
                              // @ts-ignore - indeterminate is valid but not in types
                              indeterminate={someSelected}
                              onCheckedChange={() => toggleCategory(category)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-medium">{category}</span>
                            <Badge variant="secondary" className="ml-auto mr-2">
                              {selectedInCategory}/{cols.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-2 pb-3">
                            {cols.map(col => (
                              <label
                                key={col.key}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                              >
                                <Checkbox
                                  checked={selectedColumns.has(col.key)}
                                  onCheckedChange={() => toggleColumn(col.key)}
                                />
                                <span className="text-sm">
                                  {col.label}
                                  {col.isEstimated && (
                                    <span className="text-muted-foreground ml-1">(Est)</span>
                                  )}
                                </span>
                              </label>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </ScrollArea>

              {/* Saved Templates List */}
              {templates.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Your Saved Templates</Label>
                    <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto">
                      {templates.map(template => (
                        <div
                          key={template.id}
                          className={`flex items-center justify-between p-2 rounded-lg border ${
                            selectedTemplateId === template.id ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <div
                            className="flex items-center gap-2 cursor-pointer flex-1"
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            {template.isDefault && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <span className="font-medium">{template.name}</span>
                            {template.description && (
                              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                — {template.description}
                              </span>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {template.columns.length} cols
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {!template.isDefault && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleSetDefault(template.id)}
                                title="Set as default"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                              title="Delete template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing preview of first 5 rows ({selectedColumns.size} columns)
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy All to Clipboard
                      </>
                    )}
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <ScrollArea className="h-[400px]">
                    <div className="min-w-max">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            {Array.from(selectedColumns).slice(0, 8).map(key => (
                              <TableHead key={key} className="whitespace-nowrap font-semibold">
                                {getColumnLabel(key)}
                              </TableHead>
                            ))}
                            {selectedColumns.size > 8 && (
                              <TableHead className="text-muted-foreground">
                                +{selectedColumns.size - 8} more
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.map((row, i) => (
                            <TableRow key={i}>
                              {Array.from(selectedColumns).slice(0, 8).map(key => (
                                <TableCell key={key} className="whitespace-nowrap max-w-[200px] truncate">
                                  {row[key] || <span className="text-muted-foreground">—</span>}
                                </TableCell>
                              ))}
                              {selectedColumns.size > 8 && (
                                <TableCell className="text-muted-foreground">...</TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <span><strong>{startups.length}</strong> total rows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span><strong>{selectedColumns.size}</strong> columns</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-muted-foreground">Format:</span>
                    <Badge variant="outline">{exportFormat.toUpperCase()}</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={selectedColumns.size === 0 || isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export {startups.length} Startups
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Export Template</DialogTitle>
            <DialogDescription>
              Save your column selection for quick exports in the future.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Full VC Analysis, Quick Overview"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateDesc">Description (optional)</Label>
              <Input
                id="templateDesc"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="e.g., All columns for deep dive analysis"
              />
            </div>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={setAsDefault}
                onCheckedChange={(checked) => setSetAsDefault(checked as boolean)}
              />
              <span className="text-sm">Set as default template</span>
            </label>

            <div className="text-sm text-muted-foreground">
              This template will include {selectedColumns.size} columns.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!templateName.trim() || createTemplate.isPending}
            >
              {createTemplate.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

