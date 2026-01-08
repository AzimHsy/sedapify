import { getCategoryStats } from '@/app/actions/adminActions'
import AnalyticsCharts from '@/components/AnalyticsCharts'

export default async function AdminAnalyticsPage() {
  const categoryData = await getCategoryStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-500">Deep dive into your data.</p>
      </div>

      <AnalyticsCharts categoryData={categoryData} />
    </div>
  )
}