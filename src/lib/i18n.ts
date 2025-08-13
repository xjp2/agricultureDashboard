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
    zh: '工人收入与债务分析及净额