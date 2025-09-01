'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  Scale,
} from 'lucide-react';
import { useLegal } from '@/hooks/useLegal';

export default function LegalPage() {
  const { copyrightClaims, licenses, complianceStatus, isLoading } = useLegal();

  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Legal & Compliance</h1>
        <p className="text-muted-foreground">
          Manage your legal compliance, copyright, and licensing
        </p>
      </div>

      {/* Compliance Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Status
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-lg font-semibold">Compliant</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All requirements met
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Licenses
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licenses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Licensed products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Copyright Claims
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {copyrightClaims?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active claims</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="copyright">Copyright</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Documents</CardTitle>
                <CardDescription>
                  Important legal documents and agreements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Terms of Service</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: Dec 2024
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Privacy Policy</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: Dec 2024
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Checklist</CardTitle>
                <CardDescription>
                  Ensure your account meets all requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Profile information complete</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Tax information provided</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Terms of service accepted</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">GDPR consent pending</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>License Management</CardTitle>
              <CardDescription>
                Manage licenses for your products and purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licenses && licenses.length > 0 ? (
                <div className="space-y-3">
                  {licenses.map((license) => (
                    <div
                      key={license.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{license.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {license.licenseType} License
                        </p>
                      </div>
                      <Badge
                        variant={
                          license.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {license.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No licenses found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copyright" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Copyright Protection</CardTitle>
              <CardDescription>
                Monitor and manage copyright claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              {copyrightClaims && copyrightClaims.length > 0 ? (
                <div className="space-y-3">
                  {copyrightClaims.map((claim) => (
                    <Alert key={claim.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Copyright claim for "{claim.productName}" - Status:{' '}
                        {claim.status}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No copyright claims</p>
                  <p className="text-sm">Your content is protected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GDPR Compliance</CardTitle>
              <CardDescription>
                Manage your data privacy and GDPR compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your data is processed in accordance with GDPR regulations.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Privacy Settings
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Request Data Deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
