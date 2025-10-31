import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BarChart3, Users, Box, Eye, Download, Share2, TrendingUp, Calendar, Activity } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  activeUsers: number;
  projectsByStatus: { status: string; count: number }[];
  recentActivity: { event: string; count: number; date: string }[];
  topProjects: { name: string; views: number; downloads: number }[];
  usersByPlan: { plan: string; count: number }[];
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'activity'>('overview');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [
        usersResult,
        projectsResult,
        viewsResult,
        downloadsResult,
        sharesResult,
        activeUsersResult,
        projectsByStatusResult,
        recentActivityResult,
        topProjectsResult,
        usersByPlanResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('project_views').select('id', { count: 'exact', head: true }),
        supabase.from('usage_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'download'),
        supabase.from('project_shares').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('projects').select('status').is('deleted_at', null),
        supabase.from('usage_logs').select('event_type, created_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('projects').select('id, name, glb_url').is('deleted_at', null),
        supabase.from('profiles').select('plan')
      ]);

      const projectsByStatus = projectsByStatusResult.data
        ? projectsByStatusResult.data.reduce((acc: { status: string; count: number }[], project) => {
            const existing = acc.find(item => item.status === project.status);
            if (existing) {
              existing.count++;
            } else {
              acc.push({ status: project.status, count: 1 });
            }
            return acc;
          }, [])
        : [];

      const activityByDate = recentActivityResult.data
        ? recentActivityResult.data.reduce((acc: { event: string; count: number; date: string }[], log) => {
            const date = new Date(log.created_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
            const existing = acc.find(item => item.event === log.event_type && item.date === date);
            if (existing) {
              existing.count++;
            } else {
              acc.push({ event: log.event_type, count: 1, date });
            }
            return acc;
          }, [])
        : [];

      const projectViews = await Promise.all(
        (topProjectsResult.data || []).map(async (project) => {
          const [views, downloads] = await Promise.all([
            supabase.from('project_views').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
            supabase.from('usage_logs').select('id', { count: 'exact', head: true }).eq('project_id', project.id).eq('event_type', 'download')
          ]);
          return {
            name: project.name,
            views: views.count || 0,
            downloads: downloads.count || 0
          };
        })
      );

      const topProjects = projectViews
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      const usersByPlan = usersByPlanResult.data
        ? usersByPlanResult.data.reduce((acc: { plan: string; count: number }[], profile) => {
            const existing = acc.find(item => item.plan === profile.plan);
            if (existing) {
              existing.count++;
            } else {
              acc.push({ plan: profile.plan, count: 1 });
            }
            return acc;
          }, [])
        : [];

      setAnalytics({
        totalUsers: usersResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalViews: viewsResult.count || 0,
        totalDownloads: downloadsResult.count || 0,
        totalShares: sharesResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        projectsByStatus,
        recentActivity: activityByDate.slice(0, 10),
        topProjects,
        usersByPlan
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Giriş Yapmanız Gerekiyor</h2>
          <a href="/" className="text-emerald-400 hover:text-emerald-300">
            Ana sayfaya dön
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'projects', label: 'Projeler', icon: Box },
    { id: 'activity', label: 'Aktivite', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Paneli</h1>
          <p className="text-slate-400">Platform istatistikleri ve analitikler</p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-800">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : analytics ? (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    icon={Users}
                    label="Toplam Kullanıcı"
                    value={analytics.totalUsers}
                    subLabel={`${analytics.activeUsers} aktif (son 7 gün)`}
                    color="from-blue-500 to-cyan-500"
                  />
                  <StatCard
                    icon={Box}
                    label="Toplam Proje"
                    value={analytics.totalProjects}
                    subLabel={`${analytics.projectsByStatus.find(s => s.status === 'completed')?.count || 0} tamamlandı`}
                    color="from-emerald-500 to-teal-500"
                  />
                  <StatCard
                    icon={Eye}
                    label="Toplam Görüntülenme"
                    value={analytics.totalViews}
                    color="from-violet-500 to-purple-500"
                  />
                  <StatCard
                    icon={Download}
                    label="Toplam İndirme"
                    value={analytics.totalDownloads}
                    color="from-orange-500 to-red-500"
                  />
                  <StatCard
                    icon={Share2}
                    label="Toplam Paylaşım"
                    value={analytics.totalShares}
                    color="from-pink-500 to-rose-500"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Ortalama Görüntülenme"
                    value={analytics.totalProjects > 0 ? Math.round(analytics.totalViews / analytics.totalProjects) : 0}
                    subLabel="proje başına"
                    color="from-yellow-500 to-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Proje Durumları</h3>
                    <div className="space-y-3">
                      {analytics.projectsByStatus.map(item => (
                        <div key={item.status} className="flex items-center justify-between">
                          <span className="text-slate-400 capitalize">{item.status}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-slate-800 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / analytics.totalProjects) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-white font-medium w-12 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Plan Dağılımı</h3>
                    <div className="space-y-3">
                      {analytics.usersByPlan.map(item => (
                        <div key={item.plan} className="flex items-center justify-between">
                          <span className="text-slate-400">{item.plan}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-slate-800 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / analytics.totalUsers) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-white font-medium w-12 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    icon={Users}
                    label="Toplam Kullanıcı"
                    value={analytics.totalUsers}
                    color="from-blue-500 to-cyan-500"
                  />
                  <StatCard
                    icon={Activity}
                    label="Aktif Kullanıcı"
                    value={analytics.activeUsers}
                    subLabel="son 7 gün"
                    color="from-emerald-500 to-teal-500"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Aktivite Oranı"
                    value={`${Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}%`}
                    color="from-violet-500 to-purple-500"
                  />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Plan Dağılımı</h3>
                  <div className="space-y-4">
                    {analytics.usersByPlan.map(item => (
                      <div key={item.plan} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{item.plan}</span>
                          <span className="text-slate-400">{item.count} kullanıcı</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{
                              width: `${(item.count / analytics.totalUsers) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={Box}
                    label="Toplam Proje"
                    value={analytics.totalProjects}
                    color="from-emerald-500 to-teal-500"
                  />
                  <StatCard
                    icon={Eye}
                    label="Toplam Görüntülenme"
                    value={analytics.totalViews}
                    color="from-violet-500 to-purple-500"
                  />
                  <StatCard
                    icon={Download}
                    label="Toplam İndirme"
                    value={analytics.totalDownloads}
                    color="from-orange-500 to-red-500"
                  />
                  <StatCard
                    icon={Share2}
                    label="Toplam Paylaşım"
                    value={analytics.totalShares}
                    color="from-pink-500 to-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">En Popüler Projeler</h3>
                    <div className="space-y-3">
                      {analytics.topProjects.map((project, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400 font-bold text-lg">#{index + 1}</span>
                            <span className="text-white truncate max-w-[200px]">{project.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Eye className="w-4 h-4" />
                              {project.views}
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                              <Download className="w-4 h-4" />
                              {project.downloads}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Proje Durumları</h3>
                    <div className="space-y-4">
                      {analytics.projectsByStatus.map(item => (
                        <div key={item.status} className="bg-slate-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium capitalize">{item.status}</span>
                            <span className="text-slate-400">{item.count} proje</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
                              style={{
                                width: `${(item.count / analytics.totalProjects) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Son Aktiviteler
                  </h3>
                  <div className="space-y-2">
                    {analytics.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span className="text-white capitalize">{activity.event}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 text-sm">{activity.date}</span>
                        </div>
                        <span className="text-emerald-400 font-medium">{activity.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">Veri yüklenemedi</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subLabel,
  color
}: {
  icon: any;
  label: string;
  value: number | string;
  subLabel?: string;
  color: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color} bg-opacity-20`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {subLabel && <div className="text-xs text-slate-500 mt-1">{subLabel}</div>}
    </div>
  );
}
