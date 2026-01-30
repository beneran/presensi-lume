import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import AttendanceLog from '../models/AttendanceLog.js';
import Assessment from '../models/Assessment.js';

const router = express.Router();

// Real attendance data from Dinas Pendidikan
const ATTENDANCE_LIST = [
  { no: 1, name: "Sarah Nancy Tri Novedy", nip: "199011052019032013", nrk: "197888", gol: "III/B", jabatan: "Ketua Subkelompok Hubungan Masyarakat Sekretariat Dinas Pendidikan Provinsi DKI Jakarta", unitKerja: "Sekretariat" },
  { no: 2, name: "Army Maulana", nip: "199402172019031015", nrk: "196926", gol: "III/B", jabatan: "Kepala Subbagian Umum", unitKerja: "Sekretariat" },
  { no: 3, name: "Darsyam Nopyko", nip: "197811211998031003", nrk: "124415", gol: "III/D", jabatan: "Kepala Subbagian Keuangan", unitKerja: "Sekretariat" },
  { no: 4, name: "Saifuddin", nip: "197707122014081002", nrk: "188764", gol: "III/C", jabatan: "Kepala Subbagian Manajemen Aset", unitKerja: "Sekretariat" },
  { no: 5, name: "Yostiana Bella Ulfa", nip: "199209242019032018", nrk: "196624", gol: "III/B", jabatan: "Kepala Seksi Kelembagaan Dan Sumber Belajar Bidang PAUD PMPK", unitKerja: "Bidang PAUD PMPK" },
  { no: 6, name: "Arif Nasdianto", nip: "196709051999031000", nrk: "156403", gol: "IV/B", jabatan: "Ketua Subkelompok Kurikulum dan Penilaian Bidang PAUD PMPK", unitKerja: "Bidang PAUD PMPK" },
  { no: 7, name: "Fitrianti", nip: "198307122010012000", nrk: "178530", gol: "III/D", jabatan: "Ketua Subkelompok Peserta Didik dan Pembangunan Karakter Bidang PAUD PMPK", unitKerja: "Bidang PAUD PMPK" },
  { no: 8, name: "Firdi Winardi", nip: "197702112008011013", nrk: "174222", gol: "III/C", jabatan: "Kepala Seksi Kelembagaan Dan Sumber Belajar", unitKerja: "Bidang SD" },
  { no: 9, name: "Wahyono", nip: "197105151996061002", nrk: "120381", gol: "III/D", jabatan: "Ketua Subkelompok Kurikulum dan Penilaian Bidang SD", unitKerja: "Bidang SD" },
  { no: 10, name: "Zulaika", nip: "197202021993032008", nrk: "127328", gol: "IV/A", jabatan: "Ketua Subkelompok Peserta Didik dan Pembangunan Karakter Bidang SD", unitKerja: "Bidang SD" },
  { no: 11, name: "Yenny Dwi Maria", nip: "197103101998032004", nrk: "143053", gol: "IV/B", jabatan: "Kepala Seksi Kelembagaan Dan Sumber Belajar", unitKerja: "Bidang SMP" },
  { no: 12, name: "Astin Julaikhan", nip: "196906261994032003", nrk: "146811", gol: "IV/A", jabatan: "Ketua Subkelompok Kurikulum dan Penilaian Bidang SMP", unitKerja: "Bidang SMP" },
  { no: 13, name: "Dadang Suhandani", nip: "197006041994011001", nrk: "147905", gol: "IV/B", jabatan: "Ketua Subkelompok Peserta Didik dan Pembangunan Karakter Bidang SMP", unitKerja: "Bidang SMP" },
  { no: 14, name: "Umaryadi", nip: "197001121993031006", nrk: "150655", gol: "IV/B", jabatan: "Kepala Seksi Kelembagaan Dan Sumber Belajar Bidang SMA", unitKerja: "Bidang SMA" },
  { no: 15, name: "Joko Arwanto", nip: "197002281997021003", nrk: "139614", gol: "IV/B", jabatan: "Ketua Subkelompok Kurikulum dan Penilaian Bidang SMA", unitKerja: "Bidang SMA" },
  { no: 16, name: "Dwi Harmelia", nip: "197310292000122001", nrk: "164490", gol: "IV/B", jabatan: "Ketua Subkelompok Peserta Didik dan Pembangunan Karakter Bidang SMA", unitKerja: "Bidang SMA" },
  { no: 17, name: "Ningtias Safitri", nip: "199403182019032020", nrk: "196638", gol: "III/B", jabatan: "Kepala Seksi Kelembagaan Dan Sumber Belajar Bidang SMK dan KP", unitKerja: "Bidang SMK dan KP" },
  { no: 18, name: "Maman Ruhiman", nip: "197307301998021001", nrk: "155541", gol: "IV/B", jabatan: "Ketua Subkelompok Kurikulum dan Penilaian Bidang SMK dan KP", unitKerja: "Bidang SMK dan KP" },
  { no: 19, name: "Sahri", nip: "197306161998031009", nrk: "145986", gol: "IV/C", jabatan: "Ketua Subkelompok Peserta Didik dan Pembangunan Karakter Bidang SMK dan KP", unitKerja: "Bidang SMK dan KP" },
  { no: 20, name: "Juwarto", nip: "197702052006041003", nrk: "164862", gol: "III/D", jabatan: "Kepala Seksi Pendidik", unitKerja: "Bidang PTK" },
  { no: 21, name: "Zulfahmi Sangunratu", nip: "198805042019031011", nrk: "197958", gol: "III/B", jabatan: "Kepala Seksi Tenaga Kependidikan", unitKerja: "Bidang PTK" },
  { no: 22, name: "Aid", nip: "197003101992031004", nrk: "156541", gol: "IV/A", jabatan: "Ketua Subkelompok Pengembangan Karir", unitKerja: "Bidang PTK" },
  { no: 23, name: "Zuchaeri Ecky Ramadan", nip: "199203142019031021", nrk: "197693", gol: "III/D", jabatan: "Ketua Subkelompok Perencanaan Bidang P dan A", unitKerja: "Bidang P dan A" },
  { no: 24, name: "Tri Widodo Ben Santoso", nip: "198504112010011022", nrk: "177667", gol: "III/D", jabatan: "Ketua Subkelompok Pemantauan dan Evaluasi Bidang P dan A", unitKerja: "Bidang P dan A" },
  { no: 25, name: "Meidinta Rindatania", nip: "199505022019032015", nrk: "197041", gol: "III/B", jabatan: "Ketua Subkelompok Standardisasi dan Pengembangan Bidang P dan A", unitKerja: "Bidang P dan A" },
  { no: 26, name: "Rahmawati", nip: "197203121996032002", nrk: "119681", gol: "IV/A", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JP 1" },
  { no: 27, name: "Sriwahyuningsih", nip: "197309271998032006", nrk: "123715", gol: "IV/A", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JP 1" },
  { no: 28, name: "Syahril", nip: "198007142009021003", nrk: "202517", gol: "III/D", jabatan: "Kepala Seksi Sekolah Dasar", unitKerja: "Sudindik JP 1" },
  { no: 29, name: "Nur Dewi Afifah", nip: "196911111999032006", nrk: "162967", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JP 1" },
  { no: 30, name: "Rokhidin", nip: "197806102011071001", nrk: "182680", gol: "III/C", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JP 1" },
  { no: 31, name: "Muhammad Bayu Primahanta", nip: "198208302010011024", nrk: "177733", gol: "III/D", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JP 1" },
  { no: 32, name: "Dwi Septarina", nip: "197809272011012008", nrk: "181630", gol: "III/D", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JP 2" },
  { no: 33, name: "Temi Purnomo", nip: "197309062011071001", nrk: "182685", gol: "III/C", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JP 2" },
  { no: 34, name: "Asriyanto", nip: "197801112008011013", nrk: "171806", gol: "III/C", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JP 2" },
  { no: 35, name: "Yayah Nur Aliyah", nip: "197008231995122001", nrk: "146917", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JP 2" },
  { no: 36, name: "Didi Arwadi", nip: "197208051993031002", nrk: "142588", gol: "III/C", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JP 2" },
  { no: 37, name: "Ibnu Hajar", nip: "198706302010011008", nrk: "179878", gol: "III/D", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JS 1" },
  { no: 38, name: "Yuni Suryaningsih", nip: "197306302008012008", nrk: "172069", gol: "III/C", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JS 1" },
  { no: 39, name: "Esih Setiati", nip: "196904261993032004", nrk: "155075", gol: "III/D", jabatan: "Kepala Seksi Sekolah Dasar", unitKerja: "Sudindik JS 1" },
  { no: 40, name: "Aziza", nip: "197008281997022005", nrk: "131923", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JS 1" },
  { no: 41, name: "Indra Ariesto", nip: "197803271997021001", nrk: "128596", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JS 1" },
  { no: 42, name: "Yuliyati Nurmaya", nip: "198101092008012012", nrk: "174638", gol: "III/B", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JS 1" },
  { no: 43, name: "Rusmiati Suci Prihatin", nip: "197211041998032007", nrk: "124660", gol: "IV/A", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JS 2" },
  { no: 44, name: "Dyah Restyani", nip: "199405042019032017", nrk: "197900", gol: "III/B", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JS 2" },
  { no: 45, name: "Budi Purwanti", nip: "197011281997032002", nrk: "140416", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Dasar", unitKerja: "Sudindik JS 2" },
  { no: 46, name: "Ujang Suherman", nip: "196805081995121001", nrk: "143935", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JS 2" },
  { no: 47, name: "Eti Suyanti", nip: "197509232000122002", nrk: "161215", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JS 2" },
  { no: 48, name: "Novelien Brigitha", nip: "198811122015042002", nrk: "185216", gol: "III/C", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JS 2" },
  { no: 49, name: "Ignatius Yudo Pamungkas", nip: "198807052015041002", nrk: "185135", gol: "III/C", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JB 1" },
  { no: 50, name: "Fakhrul Alam", nip: "197003142000031003", nrk: "156408", gol: "IV/A", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JB 1" },
  { no: 51, name: "Nurohmah", nip: "196805181993032007", nrk: "117252", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Dasar", unitKerja: "Sudindik JB 1" },
  { no: 52, name: "Lina Purnamaasih", nip: "196811071994052001", nrk: "136811", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JB 1" },
  { no: 53, name: "Muchlis", nip: "196908221999031001", nrk: "129432", gol: "III/D", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JB 1" },
  { no: 54, name: "Wanto", nip: "196802091991121001", nrk: "116091", gol: "IV/B", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JB 1" },
  { no: 55, name: "Oman", nip: "197211121998031009", nrk: "124922", gol: "IV/A", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JB 2" },
  { no: 56, name: "Wawat Rusmanawati", nip: "197107101993082001", nrk: "117608", gol: "IV/B", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JB 2" },
  { no: 57, name: "Tuhfatul Ahbab", nip: "197003101991032009", nrk: "115494", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Dasar", unitKerja: "Sudindik JB 2" },
  { no: 58, name: "Rusmala Nainggolan", nip: "197004121995122001", nrk: "162954", gol: "IV/C", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JB 2" },
  { no: 59, name: "Suharto", nip: "196911081997031005", nrk: "138200", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JB 2" },
  { no: 60, name: "Hasim", nip: "196904041995121004", nrk: "142078", gol: "III/D", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JB 2" },
  { no: 61, name: "Teguh Prayoga", nip: "197401032006041015", nrk: "165659", gol: "III/D", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JT 1" },
  { no: 62, name: "Asih Lestari", nip: "196803131990032006", nrk: "150846", gol: "III/D", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JT 1" },
  { no: 63, name: "Tri Kurniasih", nip: "197602131999032007", nrk: "164226", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JT 1" },
  { no: 64, name: "Wiji Kusrini", nip: "197105011997032005", nrk: "132731", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JT 1" },
  { no: 65, name: "Agus Wahyu Sutopo", nip: "196808081997031003", nrk: "143278", gol: "IV/C", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JT 1" },
  { no: 66, name: "Luhur Pambudi", nip: "198701072010011010", nrk: "176901", gol: "III/D", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JT 2" },
  { no: 67, name: "Rusdah", nip: "197209062008012011", nrk: "173704", gol: "III/B", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JT 2" },
  { no: 68, name: "Jumadi", nip: "197102042006041020", nrk: "165345", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Dasar", unitKerja: "Sudindik JT 2" },
  { no: 69, name: "Sriyadi", nip: "197008311994121001", nrk: "152381", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JT 2" },
  { no: 70, name: "Wanito Handoyo", nip: "196908021998021001", nrk: "148147", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JT 2" },
  { no: 71, name: "Kurniawati", nip: "197609202006042027", nrk: "165235", gol: "III/D", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JT 2" },
  { no: 72, name: "Iis Budiana", nip: "197404122011071001", nrk: "182669", gol: "III/D", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JU 1" },
  { no: 73, name: "Ramli", nip: "196802181991021001", nrk: "114944", gol: "IV/B", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JU 1" },
  { no: 74, name: "Corry Maryana Siagian", nip: "198406172011012017", nrk: "181901", gol: "III/D", jabatan: "Kepala Seksi Sekolah Dasar", unitKerja: "Sudindik JU 1" },
  { no: 75, name: "Niyata Sirat", nip: "197106101997022002", nrk: "138267", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JU 1" },
  { no: 76, name: "Rachiman", nip: "197003041995011002", nrk: "132402", gol: "IV/A", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JU 1" },
  { no: 77, name: "Lita Natalia", nip: "198602282014032001", nrk: "183986", gol: "III/C", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JU 1" },
  { no: 78, name: "Mukheri", nip: "197504022008011012", nrk: "173995", gol: "III/C", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik JU 2" },
  { no: 79, name: "Meliyati", nip: "197912152008012022", nrk: "173505", gol: "III/D", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat Dan Pendidikan Khusus", unitKerja: "Sudindik JU 2" },
  { no: 80, name: "Mulyadi", nip: "197011071993081001", nrk: "117561", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Dasar", unitKerja: "Sudindik JU 2" },
  { no: 81, name: "Acep Mahmudin", nip: "197008211992011003", nrk: "137535", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Menengah Pertama Dan Sekolah Menengah Atas", unitKerja: "Sudindik JU 2" },
  { no: 82, name: "Suyamti", nip: "196807041994122003", nrk: "132400", gol: "IV/B", jabatan: "Kepala Seksi Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik JU 2" },
  { no: 83, name: "Agus Isnadi", nip: "196910221994121001", nrk: "136039", gol: "IV/B", jabatan: "Kepala Seksi Pendidik Dan Tenaga Kependidikan", unitKerja: "Sudindik JU 2" },
  { no: 84, name: "Bastian", nip: "197704122007011020", nrk: "167478", gol: "III/B", jabatan: "Kepala Subbagian Tata Usaha", unitKerja: "Sudindik P. 1000" },
  { no: 85, name: "Puji Priyono", nip: "196908031998031004", nrk: "147619", gol: "IV/A", jabatan: "Kepala Seksi Pendidikan Anak Usia Dini, Pendidikan Masyarakat, Pendidikan Khusus Dan Sekolah Dasar", unitKerja: "Sudindik P. 1000" },
  { no: 86, name: "Solihin", nip: "197201202008011011", nrk: "170125", gol: "III/D", jabatan: "Kepala Seksi Sekolah Menengah Pertama, Sekolah Menengah Atas, Sekolah Menengah Kejuruan, Kursus Dan Pelatihan", unitKerja: "Sudindik P. 1000" },
  { no: 87, name: "Dian Kurniasari Citra Dewi", nip: "199302172019032008", nrk: "197548", gol: "III/B", jabatan: "Kepala Subbagian Tata Usaha P4OP", unitKerja: "P4OP" },
  { no: 88, name: "Azmi", nip: "199611032019031004", nrk: "195499", gol: "III/B", jabatan: "Kepala Subbagian Tata Usaha Pusdatindik", unitKerja: "Pusdatindik" },
  { no: 89, name: "Achmad Suhendi", nip: "197704232014121001", nrk: "189662", gol: "III/C", jabatan: "Kepala Subbagian Tata Usaha UP Prasardik", unitKerja: "UP Prasardik" },
  { no: 90, name: "Dion Afyn Mawarid", nip: "199404172019031010", nrk: "197350", gol: "III/B", jabatan: "Kepala Subbagian Tata Usaha P4 JUKS", unitKerja: "P4 JUKS" },
  { no: 91, name: "Mohammad Shidqi Daud", nip: "197605062010011021", nrk: "177899", gol: "III/D", jabatan: "Kepala Subbagian Tata Usaha P4 Jakarta Selatan", unitKerja: "P4 Jakarta Selatan" },
  { no: 92, name: "Agustina Purdjanti", nip: "197208201992032002", nrk: "180164", gol: "IV/A", jabatan: "Kepala Subbagian Tata Usaha P4 Jakarta Barat", unitKerja: "P4 Jakarta Barat" },
  { no: 93, name: "Dewi Lestari", nip: "197806062008012027", nrk: "171796", gol: "III/C", jabatan: "Kepala Subbagian Tata Usaha P4 Jakarta Timur", unitKerja: "P4 Jakarta Timur" }
];

// Seed initial data
router.post('/', async (req, res) => {
  try {
    const { reset } = req.body;

    if (reset) {
      // Clear existing data
      await User.deleteMany({});
      await Session.deleteMany({});
      await AttendanceLog.deleteMany({});
      await Assessment.deleteMany({});
    }

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !reset) {
      return res.json({ 
        message: 'Data already exists. Use reset: true to clear and reseed.',
        counts: {
          users: existingUsers,
          sessions: await Session.countDocuments(),
          attendanceLogs: await AttendanceLog.countDocuments(),
          assessments: await Assessment.countDocuments()
        }
      });
    }

    // Create participants from the real attendance list
    const participants = ATTENDANCE_LIST.map((p, idx) => ({
      name: p.name,
      nip: p.nip,
      nrk: p.nrk,
      gol: p.gol,
      jabatan: p.jabatan,
      unitKerja: p.unitKerja,
      role: 'participant',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&size=200`,
      email: `${p.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@disdik.jakarta.go.id`
    }));

    // Create admin user
    const adminUser = {
      name: 'Admin Disdik',
      nip: 'ADM-0001',
      nrk: 'ADM-0001',
      gol: '-',
      jabatan: 'Administrator Sistem',
      unitKerja: 'Sekretariat',
      role: 'admin',
      avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Disdik&background=6366f1&color=fff&size=200',
      email: 'admin@disdik.jakarta.go.id'
    };

    // Create assessor user
    const assessorUser = {
      name: 'Assessor Disdik',
      nip: 'ASS-0001',
      nrk: 'ASS-0001',
      gol: '-',
      jabatan: 'Assessor',
      unitKerja: 'Sekretariat',
      role: 'assessor',
      avatarUrl: 'https://ui-avatars.com/api/?name=Assessor+Disdik&background=10b981&color=fff&size=200',
      email: 'assessor@disdik.jakarta.go.id'
    };

    // Insert users
    await User.insertMany([adminUser, assessorUser, ...participants]);

    // Create sessions
    const today = new Date();
    const sessions = [
      {
        title: 'Rapat Koordinasi Pimpinan',
        description: 'Rapat koordinasi para pimpinan unit kerja',
        timeRange: '09:00 - 11:00',
        startTime: new Date(today.setHours(9, 0, 0, 0)),
        endTime: new Date(today.setHours(11, 0, 0, 0)),
        status: 'live'
      },
      {
        title: 'Sosialisasi Kebijakan Baru',
        description: 'Sosialisasi kebijakan pendidikan terbaru',
        timeRange: '11:30 - 13:00',
        startTime: new Date(today.setHours(11, 30, 0, 0)),
        endTime: new Date(today.setHours(13, 0, 0, 0)),
        status: 'upcoming'
      },
      {
        title: 'Workshop Digitalisasi',
        description: 'Workshop transformasi digital pendidikan',
        timeRange: '14:00 - 15:30',
        startTime: new Date(today.setHours(14, 0, 0, 0)),
        endTime: new Date(today.setHours(15, 30, 0, 0)),
        status: 'upcoming'
      },
      {
        title: 'Evaluasi Program',
        description: 'Evaluasi program kerja triwulan',
        timeRange: '16:00 - 17:00',
        startTime: new Date(today.setHours(16, 0, 0, 0)),
        endTime: new Date(today.setHours(17, 0, 0, 0)),
        status: 'upcoming'
      }
    ];

    await Session.insertMany(sessions);

    // Get counts
    const counts = {
      users: await User.countDocuments(),
      participants: await User.countDocuments({ role: 'participant' }),
      sessions: await Session.countDocuments(),
      attendanceLogs: await AttendanceLog.countDocuments(),
      assessments: await Assessment.countDocuments()
    };

    res.status(201).json({
      message: 'Database seeded successfully with Disdik attendance data',
      counts
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database', details: error.message });
  }
});

// Get current data counts
router.get('/status', async (req, res) => {
  try {
    const counts = {
      users: await User.countDocuments(),
      participants: await User.countDocuments({ role: 'participant' }),
      admins: await User.countDocuments({ role: 'admin' }),
      assessors: await User.countDocuments({ role: 'assessor' }),
      sessions: await Session.countDocuments(),
      attendanceLogs: await AttendanceLog.countDocuments(),
      assessments: await Assessment.countDocuments()
    };

    res.json(counts);
  } catch (error) {
    console.error('Error fetching seed status:', error);
    res.status(500).json({ error: 'Failed to fetch seed status' });
  }
});

export default router;
