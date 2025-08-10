@@ .. @@
 import React from 'react';
 import { Bone as Drone, Map, Users, Package, BarChart4, Sprout, Cloud, AlertTriangle } from 'lucide-react';
 import StatCard from '../components/StatCard';
 import WeatherCard from '../components/WeatherCard';
 import DroneCard from '../components/DroneCard';
 import FieldCard from '../components/FieldCard';
+import { useLanguage } from '../contexts/LanguageContext';

 interface DashboardHomeProps {
   darkMode: boolean;
 }

 const DashboardHome: React.FC<DashboardHomeProps> = ({ darkMode }) => {
+  const { t } = useLanguage();
   
   return (
     <div className="space-y-6">
       <div>
         <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
-          Farm Overview
+          {t('farmOverview')}
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <StatCard 
-            title="Active Drones" 
+            title={t('activeDrones')} 
             value="8/12" 
             icon={<Drone size={20} />} 
             trend={5} 
             color="blue"
             darkMode={darkMode}
           />
           <StatCard 
-            title="Field Health" 
+            title={t('fieldHealth')} 
             value="87%" 
             icon={<Map size={20} />} 
             trend={-2} 
             color="green"
             darkMode={darkMode}
           />
           <StatCard 
-            title="Workers on Duty" 
+            title={t('workersOnDuty')} 
             value="18" 
             icon={<Users size={20} />} 
             trend={0} 
             color="purple"
             darkMode={darkMode}
           />
           <StatCard 
-            title="Inventory Status" 
+            title={t('inventoryStatus')} 
             value="12" 
             icon={<Package size={20} />} 
             trend={-4} 
             color="yellow"
             darkMode={darkMode}
           />
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
           <div className="flex items-center justify-between mb-4">
             <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
-              Weather Conditions
+              {t('weatherConditions')}
             </h2>
             <button className={`text-sm px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
-              View Forecast
+              {t('viewForecast')}
             </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <WeatherCard 
               location="North Fields"
               date="Today, May 10"
               temperature={24}
               condition="sunny"
               humidity={45}
               windSpeed={8}
               precipitation={0}
               darkMode={darkMode}
             />
             <WeatherCard 
               location="South Fields"
               date="Today, May 10"
               temperature={22}
               condition="cloudy"
               humidity={60}
               windSpeed={12}
               precipitation={5}
               darkMode={darkMode}
             />
           </div>
         </div>

         <div>
           <div className="flex items-center justify-between mb-4">
             <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
-              Alerts
+              {t('alerts')}
             </h2>
             <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'}`}>
               4 New
             </span>
           </div>
           <div className={`space-y-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 shadow-sm`}>
             <div className={`flex items-start p-3 rounded-md ${darkMode ? 'bg-red-900/10' : 'bg-red-50'} border ${darkMode ? 'border-red-900/20' : 'border-red-100'}`}>
               <AlertTriangle size={20} className="text-red-500 mr-3 mt-0.5" />
               <div>
                 <h4 className={`font-medium text-sm ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                   Drone Maintenance Required
                 </h4>
                 <p className={`text-xs mt-1 ${darkMode ? 'text-red-300/70' : 'text-red-700/70'}`}>
                   Drone DJI-003 requires immediate maintenance. Battery efficiency below 60%.
                 </p>
                 <div className="mt-2">
                   <button className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                     Schedule Maintenance
                   </button>
                 </div>
               </div>
             </div>
             
             <div className={`flex items-start p-3 rounded-md ${darkMode ? 'bg-yellow-900/10' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-900/20' : 'border-yellow-100'}`}>
               <AlertTriangle size={20} className="text-yellow-500 mr-3 mt-0.5" />
               <div>
                 <h4 className={`font-medium text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                   Low Inventory Alert
                 </h4>
                 <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-300/70' : 'text-yellow-700/70'}`}>
                   Fertilizer NPK-15-15-15 stock is below minimum threshold (20kg remaining).
                 </p>
                 <div className="mt-2">
                   <button className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/40' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
                     Order More
                   </button>
                 </div>
               </div>
             </div>
             
             <div className={`flex items-start p-3 rounded-md ${darkMode ? 'bg-blue-900/10' : 'bg-blue-50'} border ${darkMode ? 'border-blue-900/20' : 'border-blue-100'}`}>
               <AlertTriangle size={20} className="text-blue-500 mr-3 mt-0.5" />
               <div>
                 <h4 className={`font-medium text-sm ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                   Soil Moisture Low
                 </h4>
                 <p className={`text-xs mt-1 ${darkMode ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
                   Field A3 - Eastern Section soil moisture at 22% (below 30% threshold).
                 </p>
                 <div className="mt-2">
                   <button className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
                     Schedule Irrigation
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>

       <div>
         <div className="flex items-center justify-between mb-4">
           <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
-            Recent Activity
+            {t('recentActivity')}
           </h2>
           <button className={`text-sm px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
-            View All
+            {t('viewAll')}
           </button>
         </div>
         <div className={`rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-sm`}>
           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
             <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
               <tr>
                 <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
-                  Activity
+                  {t('activity')}
                 </th>
                 <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
-                  Performed By
+                  {t('performedBy')}
                 </th>
                 <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
-                  Location
+                  {t('location')}
                 </th>
                 <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
-                  Time
+                  {t('time')}
                 </th>
                 <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
-                  Status
+                  {t('status')}
                 </th>
               </tr>
             </thead>
             <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
               <tr>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                   Pesticide Application
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   John Smith
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   Field A2
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   1 hour ago
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
-                    Completed
+                    {t('completed')}
                   </span>
                 </td>
               </tr>
               <tr>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                   Soil Testing
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   Drone DJI-005
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   Field C1
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   3 hours ago
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
-                    Analyzing
+                    {t('analyzing')}
                   </span>
                 </td>
               </tr>
               <tr>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                   Equipment Maintenance
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   Sarah Johnson
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   Workshop
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   Yesterday
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
-                    Completed
+                    {t('completed')}
                   </span>
                 </td>
               </tr>
               <tr>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                   Irrigation System Check
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   Mike Davis
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   All Fields
                 </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                   Yesterday
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
-                    In Progress
+                    {t('inProgress')}
                   </span>
                 </td>
               </tr>
             </tbody>
           </table>
         </div>
       </div>
     </div>
   );
 };