'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Plus, Download, Eye, Calendar, Crown } from 'lucide-react';
import {
  useLegalDocumentTemplates,
  useUserLegalDocuments,
  useGenerateLegalDocument,
} from '@/hooks/useLegal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateDocumentSchema } from '@/lib/validations/legal';
import type {
  GenerateDocumentRequest,
  LegalDocumentTemplate,
} from '@/types/legal';

export function DocumentGenerator() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<LegalDocumentTemplate | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');
  const [jurisdiction, setJurisdiction] = useState<string>('US');

  const { data: templates, isLoading: templatesLoading } =
    useLegalDocumentTemplates(documentType || undefined, jurisdiction);
  const { data: userDocuments, isLoading: documentsLoading } =
    useUserLegalDocuments();
  const generateDocument = useGenerateLegalDocument();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GenerateDocumentRequest>({
    resolver: zodResolver(generateDocumentSchema),
  });

  const onSubmit = async (data: GenerateDocumentRequest) => {
    try {
      await generateDocument.mutateAsync(data);
      setShowGenerateDialog(false);
      reset();
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to generate document:', error);
    }
  };

  const handleTemplateSelect = (template: LegalDocumentTemplate) => {
    setSelectedTemplate(template);
    setValue('template_id', template.id);
    setShowGenerateDialog(true);
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'terms_of_service':
        return 'bg-blue-100 text-blue-800';
      case 'privacy_policy':
        return 'bg-green-100 text-green-800';
      case 'license_agreement':
        return 'bg-purple-100 text-purple-800';
      case 'copyright_notice':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (templatesLoading || documentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Legal Document Generator</h2>
          <p className="text-muted-foreground">
            Generate professional legal documents from templates
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={jurisdiction} onValueChange={setJurisdiction}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="EU">European Union</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
            </SelectContent>
          </Select>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="terms_of_service">Terms of Service</SelectItem>
              <SelectItem value="privacy_policy">Privacy Policy</SelectItem>
              <SelectItem value="license_agreement">
                License Agreement
              </SelectItem>
              <SelectItem value="copyright_notice">Copyright Notice</SelectItem>
              <SelectItem value="dmca_policy">DMCA Policy</SelectItem>
              <SelectItem value="refund_policy">Refund Policy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Your Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Legal Documents
          </CardTitle>
          <CardDescription>
            Documents you've generated and customized
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDocuments && userDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>
                      <Badge
                        className={getDocumentTypeColor(doc.document_type)}
                      >
                        {doc.document_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>v{doc.version}</TableCell>
                    <TableCell>
                      {new Date(doc.generated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.is_active ? 'default' : 'secondary'}>
                        {doc.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No documents generated yet
              </p>
              <p className="text-sm text-muted-foreground">
                Choose a template below to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Professional legal document templates for {jurisdiction}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          className={getDocumentTypeColor(
                            template.document_type
                          )}
                        >
                          {template.document_type.replace('_', ' ')}
                        </Badge>
                        {template.is_premium && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Jurisdiction: {template.jurisdiction}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Language: {template.language.toUpperCase()}
                    </div>
                    {template.variables && (
                      <div className="text-sm">
                        <span className="font-medium">Variables: </span>
                        <span className="text-muted-foreground">
                          {Object.keys(template.variables).length} customizable
                          fields
                        </span>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => handleTemplateSelect(template)}
                      disabled={template.is_premium} // Add subscription check here
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Document Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Legal Document</DialogTitle>
            <DialogDescription>
              Customize the template variables for your document
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{selectedTemplate.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.document_type.replace('_', ' ')} •{' '}
                  {selectedTemplate.jurisdiction}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_id">Product ID (optional)</Label>
                <Input
                  id="product_id"
                  placeholder="Link to specific product"
                  {...register('product_id')}
                />
              </div>

              {selectedTemplate.variables && (
                <div className="space-y-4">
                  <h4 className="font-medium">Template Variables</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(selectedTemplate.variables).map(
                      ([key, description]) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={key}>
                            {key
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Label>
                          <Input
                            id={key}
                            placeholder={String(description)}
                            {...register(`variables.${key}` as any)}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerateDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={generateDocument.isPending}>
                  {generateDocument.isPending
                    ? 'Generating...'
                    : 'Generate Document'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
