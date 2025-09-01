'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Eye, MousePointer, Clock } from 'lucide-react';

interface RealtimeData {
  activeUsers: number;
  pageViews: number;
  clickEvents: number;
  avgSessionTime: number;
  topPages: Array<{
    path: string;
    activeUsers: number;
  }>;
  recentEvents: Array<{
    type: string;
    page: string;
    timestamp: Date;
    userId?: string;
  }>;
}

export function RealtimeMetrics() {
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    activeUsers: 0,
    pageViews: 0,
    clickEvents: 0,
    avgSessionTime: 0,
    topPages: [],
    recentEvents: [],
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time data updates
    const generateRealtimeData = (): RealtimeData => ({
      activeUsers: Math.floor(Math.random() * 500) + 100,
      pageViews: Math.floor(Math.random() * 1000) + 500,
      clickEvents: Math.floor(Math.random() * 200) + 50,
      avgSessionTime: Math.floor(Math.random() * 300) + 120,
      topPages: [
        { path: '/', activeUsers: Math.floor(Math.random() * 50) + 20 },
        {
          path: '/marketplace',
          activeUsers: Math.floor(Math.random() * 30) + 15,
        },
        { path: '/creator', activeUsers: Math.floor(Math.random() * 25) + 10 },
        { path: '/pricing', activeUsers: Math.floor(Math.random() * 20) + 8 },
      ],
      recentEvents: [
        {
          type: 'page_view',
          page: '/marketplace',
          timestamp: new Date(Date.now() - Math.random() * 60000),
          userId: 'user_' + Math.floor(Math.random() * 1000),
        },
        {
          type: 'click',
          page: '/creator',
          timestamp: new Date(Date.now() - Math.random() * 60000),
        },
        {
          type: 'purchase',
          page: '/checkout',
          timestamp: new Date(Date.now() - Math.random() * 60000),
          userId: 'user_' + Math.floor(Math.random() * 1000),
        },
      ],
    });

    // Initial data
    setRealtimeData(generateRealtimeData());
    setIsConnected(true);

    // Update every 5 seconds
    const interval = setInterval(() => {
      setRealtimeData(generateRealtimeData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view':
        return <Eye className="h-3 w-3" />;
      case 'click':
        return <MousePointer className="h-3 w-3" />;
      case 'purchase':
        return <Activity className="h-3 w-3 text-green-500" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'page_view':
        return 'bg-blue-100 text-blue-800';
      case 'click':
        return 'bg-purple-100 text-purple-800';
      case 'purchase':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Real-time Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-2xl font-bold text-blue-600">
                {realtimeData.activeUsers}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Active Users</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Eye className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-2xl font-bold text-green-600">
                {realtimeData.pageViews}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Page Views</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MousePointer className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-2xl font-bold text-purple-600">
                {realtimeData.clickEvents}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Click Events</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-2xl font-bold text-orange-600">
                {formatTime(realtimeData.avgSessionTime)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Avg Session</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Active Pages */}
          <div>
            <h4 className="font-medium mb-3 text-sm">Top Active Pages</h4>
            <div className="space-y-2">
              {realtimeData.topPages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-gray-50"
                >
                  <span className="text-sm font-medium truncate">
                    {page.path}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {page.activeUsers}
                    </Badge>
                    <Users className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          <div>
            <h4 className="font-medium mb-3 text-sm">Recent Events</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {realtimeData.recentEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <span className="text-sm">{event.page}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getEventColor(event.type)}`}>
                      {event.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Activity Indicator */}
        <div className="flex items-center justify-center pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Updates every 5 seconds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
