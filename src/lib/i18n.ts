export type Language = 'en' | 'ms' | 'zh';

interface Translations {
  [key: string]: {
    en: string;
    ms: string;
    zh: string;
  };
}

const translations: Translations = {
  // Navigation and General
  dashboard: {
    en: 'Dashboard',
    ms: 'Papan Pemuka',
    zh: '仪表板'
  },
  fields: {
    en: 'Fields',
    ms: 'Ladang',
    zh: '田地'
  },
  rainfall: {
    en: 'Rainfall',
    ms: 'Hujan',
    zh: '降雨'
  },
  fertilizer: {
    en: 'Fertilizer',
    ms: 'Baja',
    zh: '肥料'
  },
  workers: {
    en: 'Workers',
    ms: 'Pekerja',
    zh: '工人'
  },
  accounting: {
    en: 'Accounting',
    ms: 'Perakaunan',
    zh: '会计'
  },
  debt: {
    en: 'Debt & Payslip',
    ms: 'Hutang & Slip Gaji',
    zh: '债务与工资单'
  },
  settings: {
    en: 'Settings',
    ms: 'Tetapan',
    zh: '设置'
  },
  logout: {
    en: 'Logout',
    ms: 'Log Keluar',
    zh: '登出'
  },

  // Debt Management
  debtManagement: {
    en: 'Debt & Payslip Management',
    ms: 'Pengurusan Hutang & Slip Gaji',
    zh: '债务与工资单管理'
  },
  debtEntry: {
    en: 'Debt Entry',
    ms: 'Kemasukan Hutang',
    zh: '债务录入'
  },
  debtSummary: {
    en: 'Debt Summary & Payslips',
    ms: 'Ringkasan Hutang & Slip Gaji',
    zh: '债务摘要与工资单'
  },
  recordWorkerDebt: {
    en: 'Record worker debt for payroll calculation',
    ms: 'Rekod hutang pekerja untuk pengiraan gaji',
    zh: '记录工人债务用于工资计算'
  },
  viewWorkerDebtSummaries: {
    en: 'View worker debt summaries and generate payslips',
    ms: 'Lihat ringkasan hutang pekerja dan jana slip gaji',
    zh: '查看工人债务摘要并生成工资单'
  },
  addNewDebtEntry: {
    en: 'Add New Debt Entry',
    ms: 'Tambah Kemasukan Hutang Baru',
    zh: '添加新债务条目'
  },
  editDebtEntry: {
    en: 'Edit Debt Entry',
    ms: 'Edit Kemasukan Hutang',
    zh: '编辑债务条目'
  },
  updateDebtEntry: {
    en: 'Update debt information',
    ms: 'Kemas kini maklumat hutang',
    zh: '更新债务信息'
  },
  monthYear: {
    en: 'Month/Year',
    ms: 'Bulan/Tahun',
    zh: '月份/年份'
  },
  selectMonthYear: {
    en: 'Select Month/Year',
    ms: 'Pilih Bulan/Tahun',
    zh: '选择月份/年份'
  },
  debtCategory: {
    en: 'Debt Category',
    ms: 'Kategori Hutang',
    zh: '债务类别'
  },
  selectCategory: {
    en: 'Select Category',
    ms: 'Pilih Kategori',
    zh: '选择类别'
  },
  amount: {
    en: 'Amount',
    ms: 'Jumlah',
    zh: '金额'
  },
  enterDebtAmount: {
    en: 'Enter debt amount',
    ms: 'Masukkan jumlah hutang',
    zh: '输入债务金额'
  },
  recentDebtEntries: {
    en: 'Recent Debt Entries',
    ms: 'Kemasukan Hutang Terkini',
    zh: '最近债务条目'
  },
  noDebtEntriesFound: {
    en: 'No debt entries found. Add your first debt entry above.',
    ms: 'Tiada kemasukan hutang dijumpai. Tambah kemasukan hutang pertama di atas.',
    zh: '未找到债务条目。请在上方添加您的第一个债务条目。'
  },
  manageDebtCategories: {
    en: 'Manage Debt Categories',
    ms: 'Urus Kategori Hutang',
    zh: '管理债务类别'
  },
  addEditRemoveDebtTypes: {
    en: 'Add, edit, or remove debt category types',
    ms: 'Tambah, edit, atau buang jenis kategori hutang',
    zh: '添加、编辑或删除债务类别类型'
  },
  addNewDebtCategory: {
    en: 'Add New Debt Category',
    ms: 'Tambah Kategori Hutang Baru',
    zh: '添加新债务类别'
  },
  editDebtCategory: {
    en: 'Edit Debt Category',
    ms: 'Edit Kategori Hutang',
    zh: '编辑债务类别'
  },
  categoryName: {
    en: 'Category Name',
    ms: 'Nama Kategori',
    zh: '类别名称'
  },
  enterDebtCategoryName: {
    en: 'Enter debt category name (e.g., BOH HING, TONG GAS, ROKOK)',
    ms: 'Masukkan nama kategori hutang (cth: BOH HING, TONG GAS, ROKOK)',
    zh: '输入债务类别名称（例如：BOH HING、TONG GAS、ROKOK）'
  },
  optionalDebtDescription: {
    en: 'Optional description for this debt category',
    ms: 'Penerangan pilihan untuk kategori hutang ini',
    zh: '此债务类别的可选描述'
  },
  existingDebtCategories: {
    en: 'Existing Debt Categories',
    ms: 'Kategori Hutang Sedia Ada',
    zh: '现有债务类别'
  },
  noDebtCategoriesAvailable: {
    en: 'No debt categories available. Add your first category above.',
    ms: 'Tiada kategori hutang tersedia. Tambah kategori pertama di atas.',
    zh: '没有可用的债务类别。请在上方添加您的第一个类别。'
  },
  deleteDebtCategory: {
    en: 'Delete debt category',
    ms: 'Padam kategori hutang',
    zh: '删除债务类别'
  },
  editDebtCategoryTooltip: {
    en: 'Edit debt category',
    ms: 'Edit kategori hutang',
    zh: '编辑债务类别'
  },
  debtSummaryReport: {
    en: 'Debt Summary Report',
    ms: 'Laporan Ringkasan Hutang',
    zh: '债务摘要报告'
  },
  workerEarningsVsDebt: {
    en: 'Worker earnings vs debt analysis with net calculations',
    ms: 'Analisis pendapatan pekerja vs hutang dengan pengiraan bersih',
    zh: '工人收入与债务分析及净额计算'
  },
  totalDebt: {
    en: 'Total Debt',
    ms: 'Jumlah Hutang',
    zh: '总债务'
  },
  workersWithDebt: {
    en: 'Workers with Debt',
    ms: 'Pekerja dengan Hutang',
    zh: '有债务的工人'
  },
  netAmount: {
    en: 'Net Amount',
    ms: 'Jumlah Bersih',
    zh: '净额'
  },
  earnings: {
    en: 'Earnings',
    ms: 'Pendapatan',
    zh: '收入'
  },
  deductions: {
    en: 'Deductions',
    ms: 'Potongan',
    zh: '扣除'
  },
  viewPayslip: {
    en: 'View Payslip',
    ms: 'Lihat Slip Gaji',
    zh: '查看工资单'
  },
  printAllPayslips: {
    en: 'Print All Payslips',
    ms: 'Cetak Semua Slip Gaji',
    zh: '打印所有工资单'
  },
  payslip: {
    en: 'Payslip',
    ms: 'Slip Gaji',
    zh: '工资单'
  },
  workerInformation: {
    en: 'Worker Information',
    ms: 'Maklumat Pekerja',
    zh: '工人信息'
  },
  payPeriod: {
    en: 'Pay Period',
    ms: 'Tempoh Gaji',
    zh: '工资期间'
  },
  generated: {
    en: 'Generated',
    ms: 'Dijana',
    zh: '生成于'
  },
  earningsEntries: {
    en: 'Earnings Entries',
    ms: 'Kemasukan Pendapatan',
    zh: '收入条目'
  },
  debtEntries: {
    en: 'Debt Entries',
    ms: 'Kemasukan Hutang',
    zh: '债务条目'
  },
  netStatus: {
    en: 'Net Status',
    ms: 'Status Bersih',
    zh: '净状态'
  },
  credit: {
    en: 'Credit',
    ms: 'Kredit',
    zh: '贷方'
  },
  debit: {
    en: 'Debit',
    ms: 'Debit',
    zh: '借方'
  },
  totalDeductions: {
    en: 'Total Deductions',
    ms: 'Jumlah Potongan',
    zh: '总扣除额'
  },
  netPay: {
    en: 'Net Pay',
    ms: 'Gaji Bersih',
    zh: '净工资'
  },
  amountToBePaid: {
    en: 'Amount to be paid to worker',
    ms: 'Jumlah yang perlu dibayar kepada pekerja',
    zh: '应付给工人的金额'
  },
  amountOwedByWorker: {
    en: 'Amount owed by worker',
    ms: 'Jumlah yang terhutang oleh pekerja',
    zh: '工人欠款金额'
  },
  print: {
    en: 'Print',
    ms: 'Cetak',
    zh: '打印'
  },
  download: {
    en: 'Download',
    ms: 'Muat Turun',
    zh: '下载'
  },

  // Common UI elements
  loading: {
    en: 'Loading',
    ms: 'Memuatkan',
    zh: '加载中'
  },
  error: {
    en: 'Error',
    ms: 'Ralat',
    zh: '错误'
  },
  retry: {
    en: 'Retry',
    ms: 'Cuba Lagi',
    zh: '重试'
  },
  tryAgain: {
    en: 'Try Again',
    ms: 'Cuba Lagi',
    zh: '再试一次'
  },
  cancel: {
    en: 'Cancel',
    ms: 'Batal',
    zh: '取消'
  },
  save: {
    en: 'Save',
    ms: 'Simpan',
    zh: '保存'
  },
  add: {
    en: 'Add',
    ms: 'Tambah',
    zh: '添加'
  },
  edit: {
    en: 'Edit',
    ms: 'Edit',
    zh: '编辑'
  },
  delete: {
    en: 'Delete',
    ms: 'Padam',
    zh: '删除'
  },
  update: {
    en: 'Update',
    ms: 'Kemas Kini',
    zh: '更新'
  },
  create: {
    en: 'Create',
    ms: 'Cipta',
    zh: '创建'
  },
  search: {
    en: 'Search',
    ms: 'Cari',
    zh: '搜索'
  },
  filters: {
    en: 'Filters',
    ms: 'Penapis',
    zh: '筛选器'
  },
  export: {
    en: 'Export',
    ms: 'Eksport',
    zh: '导出'
  },
  total: {
    en: 'Total',
    ms: 'Jumlah',
    zh: '总计'
  },
  name: {
    en: 'Name',
    ms: 'Nama',
    zh: '姓名'
  },
  description: {
    en: 'Description',
    ms: 'Penerangan',
    zh: '描述'
  },
  date: {
    en: 'Date',
    ms: 'Tarikh',
    zh: '日期'
  },
  actions: {
    en: 'Actions',
    ms: 'Tindakan',
    zh: '操作'
  },
  noDataFound: {
    en: 'No data found',
    ms: 'Tiada data dijumpai',
    zh: '未找到数据'
  },
  loadingData: {
    en: 'Loading data...',
    ms: 'Memuatkan data...',
    zh: '加载数据中...'
  },
  errorOccurred: {
    en: 'An error occurred',
    ms: 'Ralat berlaku',
    zh: '发生错误'
  },

  // Dashboard
  systemOverview: {
    en: 'System Overview',
    ms: 'Gambaran Keseluruhan Sistem',
    zh: '系统概览'
  },
  detailedStatistics: {
    en: 'Detailed Statistics',
    ms: 'Statistik Terperinci',
    zh: '详细统计'
  },
  quickActions: {
    en: 'Quick Actions',
    ms: 'Tindakan Pantas',
    zh: '快速操作'
  },
  loadingDashboard: {
    en: 'Loading dashboard...',
    ms: 'Memuatkan papan pemuka...',
    zh: '加载仪表板中...'
  },
  totalPhases: {
    en: 'Total Phases',
    ms: 'Jumlah Fasa',
    zh: '总阶段数'
  },
  totalBlocks: {
    en: 'Total Blocks',
    ms: 'Jumlah Blok',
    zh: '总区块数'
  },
  totalWorkers: {
    en: 'Total Workers',
    ms: 'Jumlah Pekerja',
    zh: '总工人数'
  },
  activeTasks: {
    en: 'Active Tasks',
    ms: 'Tugas Aktif',
    zh: '活跃任务'
  },
  totalArea: {
    en: 'Total Area',
    ms: 'Jumlah Kawasan',
    zh: '总面积'
  },
  totalTrees: {
    en: 'Total Trees',
    ms: 'Jumlah Pokok',
    zh: '总树木数'
  },
  trackingLocations: {
    en: 'Tracking Locations',
    ms: 'Lokasi Penjejakan',
    zh: '跟踪位置'
  },
  yearlyRainfall: {
    en: 'Yearly Rainfall',
    ms: 'Hujan Tahunan',
    zh: '年降雨量'
  },
  rainyDays: {
    en: 'Rainy Days',
    ms: 'Hari Hujan',
    zh: '雨天'
  },
  departments: {
    en: 'Departments',
    ms: 'Jabatan',
    zh: '部门'
  },
  companies: {
    en: 'Companies',
    ms: 'Syarikat',
    zh: '公司'
  },
  thisMonth: {
    en: 'This Month',
    ms: 'Bulan Ini',
    zh: '本月'
  },
  totalEarnings: {
    en: 'Total Earnings',
    ms: 'Jumlah Pendapatan',
    zh: '总收入'
  },
  totalRecords: {
    en: 'Total Records',
    ms: 'Jumlah Rekod',
    zh: '总记录数'
  },
  averagePerRecord: {
    en: 'Average per Record',
    ms: 'Purata setiap Rekod',
    zh: '每条记录平均值'
  },
  addNewPhase: {
    en: 'Add New Phase',
    ms: 'Tambah Fasa Baru',
    zh: '添加新阶段'
  },
  createNewFieldPhase: {
    en: 'Create a new field phase',
    ms: 'Cipta fasa ladang baru',
    zh: '创建新的田地阶段'
  },
  recordRainfall: {
    en: 'Record Rainfall',
    ms: 'Rekod Hujan',
    zh: '记录降雨'
  },
  addDailyRainfallData: {
    en: 'Add daily rainfall data',
    ms: 'Tambah data hujan harian',
    zh: '添加每日降雨数据'
  },
  addWorker: {
    en: 'Add Worker',
    ms: 'Tambah Pekerja',
    zh: '添加工人'
  },
  registerNewWorker: {
    en: 'Register a new worker',
    ms: 'Daftar pekerja baru',
    zh: '注册新工人'
  },
  addPayment: {
    en: 'Add Payment',
    ms: 'Tambah Bayaran',
    zh: '添加付款'
  },
  recordWorkerPayment: {
    en: 'Record worker payment',
    ms: 'Rekod bayaran pekerja',
    zh: '记录工人付款'
  },
  averageDaily: {
    en: 'Average Daily',
    ms: 'Purata Harian',
    zh: '日平均'
  },
  mm: {
    en: 'mm',
    ms: 'mm',
    zh: '毫米'
  },
  acres: {
    en: 'acres',
    ms: 'ekar',
    zh: '英亩'
  },
  newHiresThisMonth: {
    en: 'New Hires This Month',
    ms: 'Pekerja Baru Bulan Ini',
    zh: '本月新员工'
  },

  // Field Visualization
  phaseDetails: {
    en: 'Phase',
    ms: 'Fasa',
    zh: '阶段'
  },
  block: {
    en: 'Block',
    ms: 'Blok',
    zh: '区块'
  },
  details: {
    en: 'Details',
    ms: 'Butiran',
    zh: '详情'
  },
  viewDetails: {
    en: 'View Details',
    ms: 'Lihat Butiran',
    zh: '查看详情'
  },
  viewTask: {
    en: 'View Tasks',
    ms: 'Lihat Tugas',
    zh: '查看任务'
  },
  manageTask: {
    en: 'Manage Task',
    ms: 'Urus Tugas',
    zh: '管理任务'
  },
  monitorAndManageFields: {
    en: 'Monitor and manage your agricultural fields',
    ms: 'Pantau dan urus ladang pertanian anda',
    zh: '监控和管理您的农田'
  },
  trees: {
    en: 'Trees',
    ms: 'Pokok',
    zh: '树木'
  },
  density: {
    en: 'Density',
    ms: 'Ketumpatan',
    zh: '密度'
  },
  datePlanted: {
    en: 'Date Planted',
    ms: 'Tarikh Ditanam',
    zh: '种植日期'
  },
  createPhase: {
    en: 'Create Phase',
    ms: 'Cipta Fasa',
    zh: '创建阶段'
  },
  createBlock: {
    en: 'Create Block',
    ms: 'Cipta Blok',
    zh: '创建区块'
  },
  createTask: {
    en: 'Create Task',
    ms: 'Cipta Tugas',
    zh: '创建任务'
  },
  sortBy: {
    en: 'Sort by',
    ms: 'Susun mengikut',
    zh: '排序方式'
  },
  viewMap: {
    en: 'View Map',
    ms: 'Lihat Peta',
    zh: '查看地图'
  },
  noPhaseData: {
    en: 'No phase data available',
    ms: 'Tiada data fasa tersedia',
    zh: '无阶段数据'
  },
  noBlocksFound: {
    en: 'No blocks found in phase {phase}',
    ms: 'Tiada blok dijumpai dalam fasa {phase}',
    zh: '在阶段 {phase} 中未找到区块'
  },
  noTasksFound: {
    en: 'No tasks found in block {block}',
    ms: 'Tiada tugas dijumpai dalam blok {block}',
    zh: '在区块 {block} 中未找到任务'
  },

  // Create Phase Modal
  createNewPhase: {
    en: 'Create New Phase',
    ms: 'Cipta Fasa Baru',
    zh: '创建新阶段'
  },
  phaseName: {
    en: 'Phase Name',
    ms: 'Nama Fasa',
    zh: '阶段名称'
  },
  enterPhaseName: {
    en: 'Enter phase name',
    ms: 'Masukkan nama fasa',
    zh: '输入阶段名称'
  },
  note: {
    en: 'Note',
    ms: 'Nota',
    zh: '注意'
  },
  areaTreesDensityNote: {
    en: 'Area, trees, and density will be automatically calculated based on blocks and tasks added to this phase.',
    ms: 'Kawasan, pokok, dan ketumpatan akan dikira secara automatik berdasarkan blok dan tugas yang ditambah ke fasa ini.',
    zh: '面积、树木和密度将根据添加到此阶段的区块和任务自动计算。'
  },

  // Create Block Modal
  createNewBlock: {
    en: 'Create New Block',
    ms: 'Cipta Blok Baru',
    zh: '创建新区块'
  },
  blockName: {
    en: 'Block Name',
    ms: 'Nama Blok',
    zh: '区块名称'
  },
  enterBlockName: {
    en: 'Enter block name',
    ms: 'Masukkan nama blok',
    zh: '输入区块名称'
  },
  optional: {
    en: 'optional',
    ms: 'pilihan',
    zh: '可选'
  },

  // Create Task Modal
  createNewTask: {
    en: 'Create New Task',
    ms: 'Cipta Tugas Baru',
    zh: '创建新任务'
  },
  taskName: {
    en: 'Task Name',
    ms: 'Nama Tugas',
    zh: '任务名称'
  },
  enterTaskName: {
    en: 'Enter task name',
    ms: 'Masukkan nama tugas',
    zh: '输入任务名称'
  },
  enterAreaInAcres: {
    en: 'Enter area in acres',
    ms: 'Masukkan kawasan dalam ekar',
    zh: '输入面积（英亩）'
  },
  enterNumberOfTrees: {
    en: 'Enter number of trees',
    ms: 'Masukkan bilangan pokok',
    zh: '输入树木数量'
  },
  calculatedDensity: {
    en: 'Calculated Density',
    ms: 'Ketumpatan Dikira',
    zh: '计算密度'
  },
  treesPerHa: {
    en: 'trees/ha',
    ms: 'pokok/ha',
    zh: '棵/公顷'
  },
  densityCalculationNote: {
    en: 'Density is automatically calculated as trees per hectare when both area and trees are provided.',
    ms: 'Ketumpatan dikira secara automatik sebagai pokok per hektar apabila kawasan dan pokok disediakan.',
    zh: '当提供面积和树木数量时，密度会自动计算为每公顷树木数。'
  },

  // Edit Modals
  editPhase: {
    en: 'Edit Phase',
    ms: 'Edit Fasa',
    zh: '编辑阶段'
  },
  editBlock: {
    en: 'Edit Block',
    ms: 'Edit Blok',
    zh: '编辑区块'
  },
  updatePhase: {
    en: 'Update Phase',
    ms: 'Kemas Kini Fasa',
    zh: '更新阶段'
  },
  updateBlock: {
    en: 'Update Block',
    ms: 'Kemas Kini Blok',
    zh: '更新区块'
  },
  phaseNameUpdateNote: {
    en: 'Updating the phase name will affect all related blocks and tasks.',
    ms: 'Mengemas kini nama fasa akan mempengaruhi semua blok dan tugas yang berkaitan.',
    zh: '更新阶段名称将影响所有相关的区块和任务。'
  },
  blockNameUpdateNote: {
    en: 'Updating the block name will affect all related tasks.',
    ms: 'Mengemas kini nama blok akan mempengaruhi semua tugas yang berkaitan.',
    zh: '更新区块名称将影响所有相关任务。'
  },

  // Delete Warnings
  deleteTaskWarning: {
    en: 'Are you sure you want to delete this task? This will also update parent block and phase data.',
    ms: 'Adakah anda pasti mahu memadam tugas ini? Ini juga akan mengemas kini data blok dan fasa induk.',
    zh: '您确定要删除此任务吗？这也会更新父区块和阶段数据。'
  },
  deleteBlockWarning: {
    en: 'Are you sure you want to delete this block? This will also delete all tasks within this block.',
    ms: 'Adakah anda pasti mahu memadam blok ini? Ini juga akan memadam semua tugas dalam blok ini.',
    zh: '您确定要删除此区块吗？这也会删除此区块内的所有任务。'
  },

  // Rainfall Tracking
  rainfallTracking: {
    en: 'Rainfall Tracking',
    ms: 'Penjejakan Hujan',
    zh: '降雨跟踪'
  },
  rainfallTrackingLocations: {
    en: 'Rainfall Tracking Locations',
    ms: 'Lokasi Penjejakan Hujan',
    zh: '降雨跟踪位置'
  },
  selectLocationToTrack: {
    en: 'Select a location to track rainfall data',
    ms: 'Pilih lokasi untuk menjejak data hujan',
    zh: '选择一个位置来跟踪降雨数据'
  },
  monitorAndTrackDaily: {
    en: 'Monitor and track daily rainfall patterns',
    ms: 'Pantau dan jejak corak hujan harian',
    zh: '监控和跟踪每日降雨模式'
  },
  totalLocations: {
    en: 'Total Locations',
    ms: 'Jumlah Lokasi',
    zh: '总位置数'
  },
  totalRainfallRecords: {
    en: 'Total Rainfall Records',
    ms: 'Jumlah Rekod Hujan',
    zh: '总降雨记录'
  },
  combinedRainfall: {
    en: 'Combined Rainfall',
    ms: 'Gabungan Hujan',
    zh: '总降雨量'
  },
  createFirstLocation: {
    en: 'Create your first location',
    ms: 'Cipta lokasi pertama anda',
    zh: '创建您的第一个位置'
  },
  addLocation: {
    en: 'Add Location',
    ms: 'Tambah Lokasi',
    zh: '添加位置'
  },
  totalRainfall: {
    en: 'Total Rainfall',
    ms: 'Jumlah Hujan',
    zh: '总降雨量'
  },
  averageRainfallPerDay: {
    en: 'Average Rainfall per Day',
    ms: 'Purata Hujan setiap Hari',
    zh: '每日平均降雨量'
  },
  today: {
    en: 'Today',
    ms: 'Hari Ini',
    zh: '今天'
  },
  hasRainfallData: {
    en: 'Has rainfall data',
    ms: 'Mempunyai data hujan',
    zh: '有降雨数据'
  },
  clickToAdd: {
    en: 'Click to add',
    ms: 'Klik untuk tambah',
    zh: '点击添加'
  },

  // Weather
  humidity: {
    en: 'Humidity',
    ms: 'Kelembapan',
    zh: '湿度'
  },
  wind: {
    en: 'Wind',
    ms: 'Angin',
    zh: '风'
  },
  rain: {
    en: 'Rain',
    ms: 'Hujan',
    zh: '雨'
  },
  goodConditions: {
    en: 'Good conditions for field work',
    ms: 'Keadaan baik untuk kerja ladang',
    zh: '适合田间作业的良好条件'
  },
  notSuitableForSpraying: {
    en: 'Not suitable for spraying',
    ms: 'Tidak sesuai untuk penyemburan',
    zh: '不适合喷洒'
  },
  cautionForDrones: {
    en: 'Caution for drone operations',
    ms: 'Berhati-hati untuk operasi dron',
    zh: '无人机操作需谨慎'
  },
  checkFieldConditions: {
    en: 'Check field conditions',
    ms: 'Periksa keadaan ladang',
    zh: '检查田间条件'
  },
  forecast: {
    en: 'Forecast',
    ms: 'Ramalan',
    zh: '预报'
  },

  // Worker Management
  workerManagement: {
    en: 'Worker Management',
    ms: 'Pengurusan Pekerja',
    zh: '工人管理'
  },
  manageWorkforce: {
    en: 'Manage your agricultural workforce',
    ms: 'Urus tenaga kerja pertanian anda',
    zh: '管理您的农业劳动力'
  },
  employeeId: {
    en: 'Employee ID',
    ms: 'ID Pekerja',
    zh: '员工ID'
  },
  department: {
    en: 'Department',
    ms: 'Jabatan',
    zh: '部门'
  },
  company: {
    en: 'Company',
    ms: 'Syarikat',
    zh: '公司'
  },
  introducer: {
    en: 'Introducer',
    ms: 'Pengenalan',
    zh: '介绍人'
  },
  dateJoined: {
    en: 'Date Joined',
    ms: 'Tarikh Menyertai',
    zh: '入职日期'
  },
  editWorker: {
    en: 'Edit Worker',
    ms: 'Edit Pekerja',
    zh: '编辑工人'
  },
  updateWorkerInfo: {
    en: 'Update worker information',
    ms: 'Kemas kini maklumat pekerja',
    zh: '更新工人信息'
  },
  enterWorkerDetails: {
    en: 'Enter worker details',
    ms: 'Masukkan butiran pekerja',
    zh: '输入工人详情'
  },
  enterFullName: {
    en: 'Enter full name',
    ms: 'Masukkan nama penuh',
    zh: '输入全名'
  },
  enterEmployeeId: {
    en: 'Enter employee ID',
    ms: 'Masukkan ID pekerja',
    zh: '输入员工ID'
  },
  enterDepartment: {
    en: 'Enter department',
    ms: 'Masukkan jabatan',
    zh: '输入部门'
  },
  enterCompany: {
    en: 'Enter company',
    ms: 'Masukkan syarikat',
    zh: '输入公司'
  },
  personWhoReferred: {
    en: 'Person who referred this worker (optional)',
    ms: 'Orang yang merujuk pekerja ini (pilihan)',
    zh: '推荐此工人的人（可选）'
  },
  updateWorker: {
    en: 'Update Worker',
    ms: 'Kemas Kini Pekerja',
    zh: '更新工人'
  },
  deleteWorkerConfirmMessage: {
    en: 'Are you sure you want to delete this worker? This action cannot be undone.',
    ms: 'Adakah anda pasti mahu memadam pekerja ini? Tindakan ini tidak boleh dibuat asal.',
    zh: '您确定要删除此工人吗？此操作无法撤销。'
  },
  deleteMultipleWorkersMessage: {
    en: 'Are you sure you want to delete {count} selected workers? This action cannot be undone.',
    ms: 'Adakah anda pasti mahu memadam {count} pekerja yang dipilih? Tindakan ini tidak boleh dibuat asal.',
    zh: '您确定要删除选定的 {count} 名工人吗？此操作无法撤销。'
  },
  searchByNameEidDepartment: {
    en: 'Search by name, EID, or department...',
    ms: 'Cari mengikut nama, EID, atau jabatan...',
    zh: '按姓名、员工ID或部门搜索...'
  },
  allDepartments: {
    en: 'All Departments',
    ms: 'Semua Jabatan',
    zh: '所有部门'
  },
  allCompanies: {
    en: 'All Companies',
    ms: 'Semua Syarikat',
    zh: '所有公司'
  },
  dateFrom: {
    en: 'Date From',
    ms: 'Tarikh Dari',
    zh: '开始日期'
  },
  dateTo: {
    en: 'Date To',
    ms: 'Tarikh Hingga',
    zh: '结束日期'
  },
  clearAll: {
    en: 'Clear All',
    ms: 'Kosongkan Semua',
    zh: '清除全部'
  },
  dept: {
    en: 'Dept',
    ms: 'Jab',
    zh: '部门'
  },
  noWorkersFound: {
    en: 'No workers found',
    ms: 'Tiada pekerja dijumpai',
    zh: '未找到工人'
  },
  addFirstWorker: {
    en: 'Add your first worker to get started',
    ms: 'Tambah pekerja pertama anda untuk bermula',
    zh: '添加您的第一个工人开始'
  },
  previous: {
    en: 'Previous',
    ms: 'Sebelumnya',
    zh: '上一页'
  },
  next: {
    en: 'Next',
    ms: 'Seterusnya',
    zh: '下一页'
  },
  page: {
    en: 'Page',
    ms: 'Halaman',
    zh: '页'
  },
  of: {
    en: 'of',
    ms: 'daripada',
    zh: '共'
  },

  // Fertilizer Management
  fertilizerManagement: {
    en: 'Fertilizer Management',
    ms: 'Pengurusan Baja',
    zh: '肥料管理'
  },
  selectPhaseToManageFertilizer: {
    en: 'Select a phase to manage fertilizer programs',
    ms: 'Pilih fasa untuk mengurus program baja',
    zh: '选择一个阶段来管理肥料程序'
  },
  manageFertilizerPrograms: {
    en: 'Manage fertilizer programs for phase {phase}',
    ms: 'Urus program baja untuk fasa {phase}',
    zh: '管理阶段 {phase} 的肥料程序'
  },
  yearToYear: {
    en: 'Year-to-Year',
    ms: 'Tahun ke Tahun',
    zh: '年度计划'
  },
  monthToMonth: {
    en: 'Month-to-Month',
    ms: 'Bulan ke Bulan',
    zh: '月度计划'
  },
  selectPhaseForFertilizer: {
    en: 'Select Phase for Fertilizer Management',
    ms: 'Pilih Fasa untuk Pengurusan Baja',
    zh: '选择阶段进行肥料管理'
  },
  choosePhaseFertilizerProgram: {
    en: 'Choose a phase to set up and manage fertilizer programs',
    ms: 'Pilih fasa untuk menyediakan dan mengurus program baja',
    zh: '选择一个阶段来设置和管理肥料程序'
  },
  noPhasesAvailable: {
    en: 'No Phases Available',
    ms: 'Tiada Fasa Tersedia',
    zh: '无可用阶段'
  },
  createPhaseFirstMessage: {
    en: 'You need to create at least one phase in Field Visualization before setting up fertilizer programs.',
    ms: 'Anda perlu mencipta sekurang-kurangnya satu fasa dalam Visualisasi Ladang sebelum menyediakan program baja.',
    zh: '在设置肥料程序之前，您需要在田地可视化中创建至少一个阶段。'
  },
  goToFieldVisualization: {
    en: 'Go to Field Visualization',
    ms: 'Pergi ke Visualisasi Ladang',
    zh: '转到田地可视化'
  },
  phaseArea: {
    en: 'Phase Area',
    ms: 'Kawasan Fasa',
    zh: '阶段面积'
  },
  totalBlocks: {
    en: 'Total Blocks',
    ms: 'Jumlah Blok',
    zh: '总区块数'
  },
  treesPerAcre: {
    en: 'trees/acre',
    ms: 'pokok/ekar',
    zh: '棵/英亩'
  },
  setupFertilizerProgram: {
    en: 'Setup Fertilizer Program',
    ms: 'Sediakan Program Baja',
    zh: '设置肥料程序'
  },
  programStartDate: {
    en: 'Program Start Date',
    ms: 'Tarikh Mula Program',
    zh: '程序开始日期'
  },
  programStarted: {
    en: 'Program started on',
    ms: 'Program dimulakan pada',
    zh: '程序开始于'
  },
  editStartDate: {
    en: 'Edit Start Date',
    ms: 'Edit Tarikh Mula',
    zh: '编辑开始日期'
  },
  ac: {
    en: 'ac',
    ms: 'ekar',
    zh: '英亩'
  },

  // Fertilizer Program Setup
  setupFertilizerProgramTitle: {
    en: 'Setup Fertilizer Program',
    ms: 'Sediakan Program Baja',
    zh: '设置肥料程序'
  },
  editProgramPeriod: {
    en: 'Edit Program Period',
    ms: 'Edit Tempoh Program',
    zh: '编辑程序期间'
  },
  programSetup: {
    en: 'Program Setup',
    ms: 'Persediaan Program',
    zh: '程序设置'
  },
  updateProgram: {
    en: 'Update Program',
    ms: 'Kemas Kini Program',
    zh: '更新程序'
  },
  setProgramDescription: {
    en: 'Set the start date for your fertilizer program. This will determine the schedule for year-to-year and month-to-month applications.',
    ms: 'Tetapkan tarikh mula untuk program baja anda. Ini akan menentukan jadual untuk aplikasi tahun ke tahun dan bulan ke bulan.',
    zh: '设置肥料程序的开始日期。这将决定年度和月度施肥的时间表。'
  },
  updateProgramDescription: {
    en: 'Update the program period to adjust your fertilizer schedule.',
    ms: 'Kemas kini tempoh program untuk menyesuaikan jadual baja anda.',
    zh: '更新程序期间以调整您的肥料时间表。'
  },
  pleaseSelectStartDate: {
    en: 'Please select a start date',
    ms: 'Sila pilih tarikh mula',
    zh: '请选择开始日期'
  },
  startProgram: {
    en: 'Start Program',
    ms: 'Mula Program',
    zh: '开始程序'
  },

  // Year-to-Year Program
  yearToYearFertilizerProgram: {
    en: 'Year-to-Year Fertilizer Program',
    ms: 'Program Baja Tahun ke Tahun',
    zh: '年度肥料程序'
  },
  clickMonthBlockToAdd: {
    en: 'Click on any month/block cell to add fertilizer entries',
    ms: 'Klik pada mana-mana sel bulan/blok untuk menambah kemasukan baja',
    zh: '点击任何月份/区块单元格添加肥料条目'
  },
  loadingProgramData: {
    en: 'Loading program data...',
    ms: 'Memuatkan data program...',
    zh: '加载程序数据中...'
  },
  totalKg: {
    en: 'Total (kg)',
    ms: 'Jumlah (kg)',
    zh: '总计（公斤）'
  },

  // Month-to-Month Program
  monthToMonthProgram: {
    en: 'Month-to-Month Program',
    ms: 'Program Bulan ke Bulan',
    zh: '月度程序'
  },
  clickDateToAddApplication: {
    en: 'Click on any date to add fertilizer applications',
    ms: 'Klik pada mana-mana tarikh untuk menambah aplikasi baja',
    zh: '点击任何日期添加肥料施用'
  },
  loadingCalendarData: {
    en: 'Loading calendar data...',
    ms: 'Memuatkan data kalendar...',
    zh: '加载日历数据中...'
  },
  hasApplications: {
    en: 'Has applications',
    ms: 'Mempunyai aplikasi',
    zh: '有施用记录'
  },

  // Fertilizer Entry
  dailyFertilizerApplication: {
    en: 'Daily Fertilizer Application',
    ms: 'Aplikasi Baja Harian',
    zh: '每日肥料施用'
  },
  existingApplications: {
    en: 'Existing Applications',
    ms: 'Aplikasi Sedia Ada',
    zh: '现有施用记录'
  },
  workerName: {
    en: 'Worker Name',
    ms: 'Nama Pekerja',
    zh: '工人姓名'
  },
  enterWorkerName: {
    en: 'Enter worker name',
    ms: 'Masukkan nama pekerja',
    zh: '输入工人姓名'
  },
  selectBlock: {
    en: 'Select Block',
    ms: 'Pilih Blok',
    zh: '选择区块'
  },
  bagSize: {
    en: 'Bag Size',
    ms: 'Saiz Beg',
    zh: '袋装规格'
  },
  quantity: {
    en: 'Quantity',
    ms: 'Kuantiti',
    zh: '数量'
  },
  enterQuantity: {
    en: 'Enter quantity',
    ms: 'Masukkan kuantiti',
    zh: '输入数量'
  },
  totalWeight: {
    en: 'Total Weight',
    ms: 'Jumlah Berat',
    zh: '总重量'
  },
  kg: {
    en: 'kg',
    ms: 'kg',
    zh: '公斤'
  },
  addApplication: {
    en: 'Add Application',
    ms: 'Tambah Aplikasi',
    zh: '添加施用'
  },
  workerNameRequired: {
    en: 'Worker name is required',
    ms: 'Nama pekerja diperlukan',
    zh: '工人姓名为必填项'
  },
  pleaseSelectBlock: {
    en: 'Please select a block',
    ms: 'Sila pilih blok',
    zh: '请选择区块'
  },
  failedToAddEntry: {
    en: 'Failed to add entry',
    ms: 'Gagal menambah kemasukan',
    zh: '添加条目失败'
  },

  // Accounting
  dataEntry: {
    en: 'Data Entry',
    ms: 'Kemasukan Data',
    zh: '数据录入'
  },
  workerSummaryReport: {
    en: 'Worker Summary Report',
    ms: 'Laporan Ringkasan Pekerja',
    zh: '工人摘要报告'
  },
  departmentSummaryReport: {
    en: 'Department Summary Report',
    ms: 'Laporan Ringkasan Jabatan',
    zh: '部门摘要报告'
  },
  departmentDetailReport: {
    en: 'Department Detail Report',
    ms: 'Laporan Butiran Jabatan',
    zh: '部门详细报告'
  },
  introducerCommissionReport: {
    en: 'Introducer Commission Report',
    ms: 'Laporan Komisi Pengenalan',
    zh: '介绍人佣金报告'
  },
  enterWorkerPayment: {
    en: 'Enter worker payment and work details',
    ms: 'Masukkan bayaran pekerja dan butiran kerja',
    zh: '输入工人付款和工作详情'
  },
  completeEarningsSummary: {
    en: 'Complete earnings summary for all workers',
    ms: 'Ringkasan pendapatan lengkap untuk semua pekerja',
    zh: '所有工人的完整收入摘要'
  },
  totalEarningsGrouped: {
    en: 'Total earnings grouped by department/category',
    ms: 'Jumlah pendapatan dikumpulkan mengikut jabatan/kategori',
    zh: '按部门/类别分组的总收入'
  },
  detailedWorkerEarnings: {
    en: 'Detailed worker earnings by department',
    ms: 'Pendapatan pekerja terperinci mengikut jabatan',
    zh: '按部门的详细工人收入'
  },
  commissionCalculations: {
    en: 'Commission calculations for introducers',
    ms: 'Pengiraan komisi untuk pengenalan',
    zh: '介绍人的佣金计算'
  },
  loadingAccountingSystem: {
    en: 'Loading accounting system...',
    ms: 'Memuatkan sistem perakaunan...',
    zh: '加载会计系统中...'
  },
  activeWorkers: {
    en: 'Active Workers',
    ms: 'Pekerja Aktif',
    zh: '活跃工人'
  },
  entry: {
    en: 'Entry',
    ms: 'Kemasukan',
    zh: '录入'
  },
  commission: {
    en: 'Commission',
    ms: 'Komisi',
    zh: '佣金'
  },

  // Accounting Data Entry
  addNewAccountingEntry: {
    en: 'Add New Accounting Entry',
    ms: 'Tambah Kemasukan Perakaunan Baru',
    zh: '添加新会计条目'
  },
  editAccountingEntry: {
    en: 'Edit Accounting Entry',
    ms: 'Edit Kemasukan Perakaunan',
    zh: '编辑会计条目'
  },
  updateAccountingEntry: {
    en: 'Update accounting entry information',
    ms: 'Kemas kini maklumat kemasukan perakaunan',
    zh: '更新会计条目信息'
  },
  month: {
    en: 'Month',
    ms: 'Bulan',
    zh: '月份'
  },
  selectMonth: {
    en: 'Select Month',
    ms: 'Pilih Bulan',
    zh: '选择月份'
  },
  selectWorker: {
    en: 'Select Worker',
    ms: 'Pilih Pekerja',
    zh: '选择工人'
  },
  workType: {
    en: 'Work Type',
    ms: 'Jenis Kerja',
    zh: '工作类型'
  },
  selectWorkType: {
    en: 'Select Work Type',
    ms: 'Pilih Jenis Kerja',
    zh: '选择工作类型'
  },
  enterBlockIdentifier: {
    en: 'Enter block identifier',
    ms: 'Masukkan pengenal blok',
    zh: '输入区块标识符'
  },
  unitOfMeasure: {
    en: 'Unit of Measure',
    ms: 'Unit Ukuran',
    zh: '计量单位'
  },
  uom: {
    en: 'UOM',
    ms: 'UOM',
    zh: '计量单位'
  },
  pricePerUnit: {
    en: 'Price per Unit',
    ms: 'Harga setiap Unit',
    zh: '单价'
  },
  enterPricePerUnit: {
    en: 'Enter price per unit',
    ms: 'Masukkan harga setiap unit',
    zh: '输入单价'
  },
  totalAmount: {
    en: 'Total Amount',
    ms: 'Jumlah Keseluruhan',
    zh: '总金额'
  },
  updateEntry: {
    en: 'Update Entry',
    ms: 'Kemas Kini Kemasukan',
    zh: '更新条目'
  },
  addEntry: {
    en: 'Add Entry',
    ms: 'Tambah Kemasukan',
    zh: '添加条目'
  },
  recentEntries: {
    en: 'Recent Entries',
    ms: 'Kemasukan Terkini',
    zh: '最近条目'
  },

  // Work and UOM Management
  manageWorkOptions: {
    en: 'Manage Work Options',
    ms: 'Urus Pilihan Kerja',
    zh: '管理工作选项'
  },
  addEditRemoveWorkTypes: {
    en: 'Add, edit, or remove work types',
    ms: 'Tambah, edit, atau buang jenis kerja',
    zh: '添加、编辑或删除工作类型'
  },
  addNewWorkOption: {
    en: 'Add New Work Option',
    ms: 'Tambah Pilihan Kerja Baru',
    zh: '添加新工作选项'
  },
  editWorkOption: {
    en: 'Edit Work Option',
    ms: 'Edit Pilihan Kerja',
    zh: '编辑工作选项'
  },
  workName: {
    en: 'Work Name',
    ms: 'Nama Kerja',
    zh: '工作名称'
  },
  enterWorkTypeName: {
    en: 'Enter work type name',
    ms: 'Masukkan nama jenis kerja',
    zh: '输入工作类型名称'
  },
  optionalDescription: {
    en: 'Optional description',
    ms: 'Penerangan pilihan',
    zh: '可选描述'
  },
  workOption: {
    en: 'Work Option',
    ms: 'Pilihan Kerja',
    zh: '工作选项'
  },
  existingWorkOptions: {
    en: 'Existing Work Options',
    ms: 'Pilihan Kerja Sedia Ada',
    zh: '现有工作选项'
  },
  noWorkOptionsAvailable: {
    en: 'No work options available',
    ms: 'Tiada pilihan kerja tersedia',
    zh: '无可用工作选项'
  },
  deleteWorkOption: {
    en: 'Delete work option',
    ms: 'Padam pilihan kerja',
    zh: '删除工作选项'
  },
  manageUomOptions: {
    en: 'Manage UOM Options',
    ms: 'Urus Pilihan UOM',
    zh: '管理计量单位选项'
  },
  addEditRemoveUomTypes: {
    en: 'Add, edit, or remove UOM types',
    ms: 'Tambah, edit, atau buang jenis UOM',
    zh: '添加、编辑或删除计量单位类型'
  },
  addNewUomOption: {
    en: 'Add New UOM Option',
    ms: 'Tambah Pilihan UOM Baru',
    zh: '添加新计量单位选项'
  },
  editUomOption: {
    en: 'Edit UOM Option',
    ms: 'Edit Pilihan UOM',
    zh: '编辑计量单位选项'
  },
  uomName: {
    en: 'UOM Name',
    ms: 'Nama UOM',
    zh: '计量单位名称'
  },
  enterUomName: {
    en: 'Enter UOM name',
    ms: 'Masukkan nama UOM',
    zh: '输入计量单位名称'
  },
  optionalUomDescription: {
    en: 'Optional UOM description',
    ms: 'Penerangan UOM pilihan',
    zh: '可选计量单位描述'
  },
  uomOption: {
    en: 'UOM Option',
    ms: 'Pilihan UOM',
    zh: '计量单位选项'
  },
  existingUomOptions: {
    en: 'Existing UOM Options',
    ms: 'Pilihan UOM Sedia Ada',
    zh: '现有计量单位选项'
  },
  noUomOptionsAvailable: {
    en: 'No UOM options available',
    ms: 'Tiada pilihan UOM tersedia',
    zh: '无可用计量单位选项'
  },
  deleteUomOption: {
    en: 'Delete UOM option',
    ms: 'Padam pilihan UOM',
    zh: '删除计量单位选项'
  },

  // Reports
  searchByNameOrEid: {
    en: 'Search by name or EID',
    ms: 'Cari mengikut nama atau EID',
    zh: '按姓名或员工ID搜索'
  },
  fromMonth: {
    en: 'From Month',
    ms: 'Dari Bulan',
    zh: '起始月份'
  },
  toMonth: {
    en: 'To Month',
    ms: 'Hingga Bulan',
    zh: '结束月份'
  },
  allMonthsFrom: {
    en: 'All Months From',
    ms: 'Semua Bulan Dari',
    zh: '所有月份从'
  },
  allMonthsTo: {
    en: 'All Months To',
    ms: 'Semua Bulan Hingga',
    zh: '所有月份到'
  },
  allCategories: {
    en: 'All Categories',
    ms: 'Semua Kategori',
    zh: '所有类别'
  },
  allWorkTypes: {
    en: 'All Work Types',
    ms: 'Semua Jenis Kerja',
    zh: '所有工作类型'
  },
  category: {
    en: 'Category',
    ms: 'Kategori',
    zh: '类别'
  },
  showing: {
    en: 'Showing',
    ms: 'Menunjukkan',
    zh: '显示'
  },
  tryAdjustingFilters: {
    en: 'Try adjusting the filters above',
    ms: 'Cuba laraskan penapis di atas',
    zh: '尝试调整上面的筛选器'
  },
  workHistory: {
    en: 'Work History',
    ms: 'Sejarah Kerja',
    zh: '工作历史'
  },
  completeWorkHistory: {
    en: 'Complete work history and earnings',
    ms: 'Sejarah kerja dan pendapatan lengkap',
    zh: '完整的工作历史和收入'
  },
  totalEntries: {
    en: 'Total Entries',
    ms: 'Jumlah Kemasukan',
    zh: '总条目数'
  },
  averagePerEntry: {
    en: 'Average per Entry',
    ms: 'Purata setiap Kemasukan',
    zh: '每条目平均值'
  },
  entries: {
    en: 'Entries',
    ms: 'Kemasukan',
    zh: '条目'
  },
  filterByMonth: {
    en: 'Filter by Month',
    ms: 'Tapis mengikut Bulan',
    zh: '按月份筛选'
  },
  allMonths: {
    en: 'All Months',
    ms: 'Semua Bulan',
    zh: '所有月份'
  },
  filterByWorkType: {
    en: 'Filter by Work Type',
    ms: 'Tapis mengikut Jenis Kerja',
    zh: '按工作类型筛选'
  },
  dateCreated: {
    en: 'Date Created',
    ms: 'Tarikh Dicipta',
    zh: '创建日期'
  },
  noWorkHistoryFound: {
    en: 'No work history found',
    ms: 'Tiada sejarah kerja dijumpai',
    zh: '未找到工作历史'
  },
  filteredTotal: {
    en: 'Filtered Total',
    ms: 'Jumlah Ditapis',
    zh: '筛选总计'
  },
  average: {
    en: 'Average',
    ms: 'Purata',
    zh: '平均'
  },
  perEntry: {
    en: 'per entry',
    ms: 'setiap kemasukan',
    zh: '每条目'
  },

  // Department Reports
  selectDepartmentCategory: {
    en: 'Select Department/Category',
    ms: 'Pilih Jabatan/Kategori',
    zh: '选择部门/类别'
  },
  chooseDepartmentToView: {
    en: 'Choose a department to view details',
    ms: 'Pilih jabatan untuk melihat butiran',
    zh: '选择部门查看详情'
  },
  departmentSummary: {
    en: 'Department Summary',
    ms: 'Ringkasan Jabatan',
    zh: '部门摘要'
  },
  perWorker: {
    en: 'per worker',
    ms: 'setiap pekerja',
    zh: '每工人'
  },
  selectDepartment: {
    en: 'Select a Department',
    ms: 'Pilih Jabatan',
    zh: '选择部门'
  },
  chooseDepartmentFromDropdown: {
    en: 'Choose a department from the dropdown above to view detailed worker earnings',
    ms: 'Pilih jabatan dari dropdown di atas untuk melihat pendapatan pekerja terperinci',
    zh: '从上面的下拉菜单中选择部门以查看详细的工人收入'
  },
  searchWorkers: {
    en: 'Search Workers',
    ms: 'Cari Pekerja',
    zh: '搜索工人'
  },
  noWorkersInDepartment: {
    en: 'No workers found in this department with the current filters',
    ms: 'Tiada pekerja dijumpai dalam jabatan ini dengan penapis semasa',
    zh: '在当前筛选条件下未找到此部门的工人'
  },
  selectDepartmentToView: {
    en: 'Select a department to view worker details',
    ms: 'Pilih jabatan untuk melihat butiran pekerja',
    zh: '选择部门查看工人详情'
  },
  workerCount: {
    en: 'Worker Count',
    ms: 'Bilangan Pekerja',
    zh: '工人数量'
  },
  averagePerWorker: {
    en: 'Average per Worker',
    ms: 'Purata setiap Pekerja',
    zh: '每工人平均'
  },
  percentageOfTotal: {
    en: 'Percentage of Total',
    ms: 'Peratusan Jumlah',
    zh: '总计百分比'
  },
  noDepartmentData: {
    en: 'No department data found',
    ms: 'Tiada data jabatan dijumpai',
    zh: '未找到部门数据'
  },
  grandTotal: {
    en: 'Grand Total',
    ms: 'Jumlah Besar',
    zh: '总计'
  },

  // Commission Reports
  introducedWorkers: {
    en: 'introduced workers',
    ms: 'pekerja yang diperkenalkan',
    zh: '介绍的工人'
  },
  noCommissionData: {
    en: 'No commission data available',
    ms: 'Tiada data komisi tersedia',
    zh: '无可用佣金数据'
  },
  noWorkersWithIntroducers: {
    en: 'No workers with introducers found in the current data set',
    ms: 'Tiada pekerja dengan pengenalan dijumpai dalam set data semasa',
    zh: '在当前数据集中未找到有介绍人的工人'
  },
  introducers: {
    en: 'introducers',
    ms: 'pengenalan',
    zh: '介绍人'
  },
  commissionRate: {
    en: 'Commission Rate',
    ms: 'Kadar Komisi',
    zh: '佣金率'
  },
  introducedWorkersEarnings: {
    en: 'introduced workers earnings',
    ms: 'pendapatan pekerja yang diperkenalkan',
    zh: '介绍工人的收入'
  },
  totalCommissions: {
    en: 'Total Commissions',
    ms: 'Jumlah Komisi',
    zh: '总佣金'
  },

  // Month names for calendar
  month1: { en: 'Jan', ms: 'Jan', zh: '一月' },
  month2: { en: 'Feb', ms: 'Feb', zh: '二月' },
  month3: { en: 'Mar', ms: 'Mac', zh: '三月' },
  month4: { en: 'Apr', ms: 'Apr', zh: '四月' },
  month5: { en: 'May', ms: 'Mei', zh: '五月' },
  month6: { en: 'Jun', ms: 'Jun', zh: '六月' },
  month7: { en: 'Jul', ms: 'Jul', zh: '七月' },
  month8: { en: 'Aug', ms: 'Ogs', zh: '八月' },
  month9: { en: 'Sep', ms: 'Sep', zh: '九月' },
  month10: { en: 'Oct', ms: 'Okt', zh: '十月' },
  month11: { en: 'Nov', ms: 'Nov', zh: '十一月' },
  month12: { en: 'Dec', ms: 'Dis', zh: '十二月' }
};

export const getTranslation = (
  language: Language, 
  key: string, 
  params?: { [key: string]: string | number }
): string => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation key "${key}" not found`);
    return key;
  }

  let text = translation[language] || translation.en;
  
  // Replace parameters in the translation
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
    });
  }
  
  return text;
};