'use client';

import * as React from 'react';
import { Job, JobStatus } from '@/lib/generated/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  ListChecks,
  Send,
  Calendar,
  ThumbsUp,
  XCircle,
  Plus,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface DashboardClientProps {
  jobs: Job[];
}

const STATUS_COLORS = {
  [JobStatus.WISHLIST]: '#3b82f6',
  [JobStatus.APPLIED]: '#eab308',
  [JobStatus.INTERVIEW]: '#a855f7',
  [JobStatus.OFFER]: '#22c55e',
  [JobStatus.REJECTED]: '#ef4444',
};

export default function DashboardClient({ jobs }: DashboardClientProps) {
  const stats = React.useMemo(() => {
    const total = jobs.length;
    const byStatus = {
      [JobStatus.WISHLIST]: jobs.filter(j => j.status === JobStatus.WISHLIST).length,
      [JobStatus.APPLIED]: jobs.filter(j => j.status === JobStatus.APPLIED).length,
      [JobStatus.INTERVIEW]: jobs.filter(j => j.status === JobStatus.INTERVIEW).length,
      [JobStatus.OFFER]: jobs.filter(j => j.status === JobStatus.OFFER).length,
      [JobStatus.REJECTED]: jobs.filter(j => j.status === JobStatus.REJECTED).length,
    };

    return {
      total,
      byStatus,
    };
  }, [jobs]);

  // Prepare data for status distribution pie chart
  const statusDistributionData = React.useMemo(() => {
    return [
      { name: 'Wishlist', value: stats.byStatus[JobStatus.WISHLIST], color: STATUS_COLORS[JobStatus.WISHLIST] },
      { name: 'Applied', value: stats.byStatus[JobStatus.APPLIED], color: STATUS_COLORS[JobStatus.APPLIED] },
      { name: 'Interview', value: stats.byStatus[JobStatus.INTERVIEW], color: STATUS_COLORS[JobStatus.INTERVIEW] },
      { name: 'Offer', value: stats.byStatus[JobStatus.OFFER], color: STATUS_COLORS[JobStatus.OFFER] },
      { name: 'Rejected', value: stats.byStatus[JobStatus.REJECTED], color: STATUS_COLORS[JobStatus.REJECTED] },
    ].filter(item => item.value > 0);
  }, [stats.byStatus]);

  // Prepare data for application trends over time (last 7 days)
  const trendsData = React.useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const jobsOnDate = jobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate.toDateString() === date.toDateString();
      });

      return {
        date: dateStr,
        applications: jobsOnDate.length,
      };
    });
  }, [jobs]);

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.total,
      icon: Briefcase,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Wishlist',
      value: stats.byStatus[JobStatus.WISHLIST],
      icon: ListChecks,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Applied',
      value: stats.byStatus[JobStatus.APPLIED],
      icon: Send,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Interviews',
      value: stats.byStatus[JobStatus.INTERVIEW],
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Offers',
      value: stats.byStatus[JobStatus.OFFER],
      icon: ThumbsUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Rejected',
      value: stats.byStatus[JobStatus.REJECTED],
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
        <p className='text-muted-foreground mt-2'>
          Track your job search progress and key metrics.
        </p>
      </div>

      {/* Quick Actions */}
      <div className='space-y-3'>
        <Button asChild className='w-full sm:w-auto'>
          <Link href='/jobs'>
            <Plus className='mr-2 h-4 w-4' />
            Add Job
          </Link>
        </Button>
        <div className='flex gap-3'>
          <Button variant='outline' asChild className='flex-1 sm:flex-none sm:w-auto'>
            <Link href='/kanban'>
              <LayoutGrid className='mr-2 h-4 w-4' />
              Kanban Board
            </Link>
          </Button>
          <Button variant='outline' asChild className='flex-1 sm:flex-none sm:w-auto'>
            <Link href='/jobs'>
              <TableIcon className='mr-2 h-4 w-4' />
              Jobs Table
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6'>
                <CardTitle className='text-xs sm:text-sm font-medium'>
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className='p-3 sm:p-6 pt-0'>
                <div className='text-xl sm:text-2xl font-bold'>{stat.value}</div>
                {stat.title !== 'Total Applications' && (
                  <p className='text-[10px] sm:text-xs text-muted-foreground mt-1'>
                    {stats.total > 0
                      ? `${Math.round((stat.value / stats.total) * 100)}% of total`
                      : 'No applications yet'}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDistributionData.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Application Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={trendsData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor='end'
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey='applications' fill='#3b82f6' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
