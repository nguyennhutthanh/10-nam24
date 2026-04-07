// ===== DU LIEU THAM KHAO CUA CONG TY VHEC =====
// Cong ty TNHH Ky su Cong nghe cao Viet Nam
// Vietnam Hi-Tech Engineering Company Limited
// Thanh lap: 2016 | Ky niem 10 nam: 2026
// Dia chi: Tang 23, Viwaseen Tower, 48 To Huu, Nam Tu Liem, Ha Noi
// Website: vhec.vn | Email: info@vhec.vn | Hotline: (024) 6680 5588
// MST: 0108743360 | Giam doc: Pham Van Tuan

export const timelineData = [
  {
    year: '2016',
    title: 'Thanh Lap VHEC',
    description:
      'Cong ty TNHH Ky su Cong nghe cao Viet Nam chinh thuc ra doi. Doi ngu sang lap la nhung ky su xuat sac tu Dai hoc Bach khoa Ha Noi, mang su menh "Ung dung cong nghe ky su tien tien de nang cao gia tri cuoc song".',
    icon: '🚀',
    side: 'left',
  },
  {
    year: '2017',
    title: 'Buoc Chan Vao Nhat Ban',
    description:
      'VHEC ky ket nhung hop dong quoc te dau tien voi doi tac Nhat Ban. Xay dung doi ngu chuyen gia phan mem nhung dieu khien ECU o to, linh vuc ky thuat doi hoi do chinh xac cao nhat.',
    icon: '🇯🇵',
    side: 'right',
  },
  {
    year: '2019',
    title: 'Dang Ky Va Chuyen Tru So',
    description:
      'Ngay 17/5/2019: cap giay phep kinh doanh chinh thuc (MST: 0108743360). Chuyen van phong len Tang 23, Viwaseen Tower, 48 To Huu, Ha Noi, khong gian hien dai xung tam doi tac Nhat Ban.',
    icon: '🏢',
    side: 'left',
  },
  {
    year: '2020',
    title: 'Ra Mat ADAI Lab',
    description:
      'VHEC dong sang lap ADAI Lab (Applied Data Science & Artificial Intelligence Lab) cung Individual Systems (IVS), cong ty IT 20 nam kinh nghiem, 400 nhan vien, 6 van phong Viet-Nhat. Tien phong AI va Data Science.',
    icon: '🤖',
    side: 'right',
  },
  {
    year: '2022',
    title: 'Mo Rong He Sinh Thai',
    description:
      'Ra mat cac giai phap ERP canh tranh voi SAP, Dynamics 365, Salesforce. Mo rong sang Chinh phu dien tu, Y te thong minh, Kiem tra giao thong, Nong nghiep so. Hop tac voi Hitachi, Nissan, Keidanren.',
    icon: '💡',
    side: 'left',
  },
  {
    year: '2026',
    title: 'Ky Niem 10 Nam Vuon Tam',
    description:
      'Mot thap ky tu hao: 40+ ky su nong cot (80% Bach khoa Ha Noi), mang luoi 500+ chuyen gia, 100+ du an quoc te hoan thanh. VHEC tu startup Viet Nam thanh doi tac tin cay hang dau cua Nhat Ban.',
    icon: '🎉',
    side: 'right',
  },
]

export const achievementsData = [
  {
    value: 10,
    suffix: ' NAM',
    label: 'Nam Phat Trien',
    icon: '⭐',
    desc: '2016 - 2026',
  },
  {
    value: 40,
    suffix: '+',
    label: 'Ky Su Nong Cot',
    icon: '👨‍💻',
    desc: '80% Bach khoa Ha Noi',
  },
  {
    value: 500,
    suffix: '+',
    label: 'Mang Luoi Chuyen Gia',
    icon: '🌐',
    desc: 'Viet Nam va Nhat Ban',
  },
  {
    value: 100,
    suffix: '+',
    label: 'Du An Quoc Te',
    icon: '🏗️',
    desc: 'Nhat Ban va cac nuoc',
  },
  {
    value: 3,
    suffix: ' DOI TAC',
    label: 'Tap Doan Nhat Ban',
    icon: '🤝',
    desc: 'Hitachi · Nissan · IVS',
  },
  {
    value: 2016,
    suffix: '',
    label: 'Nam Thanh Lap',
    icon: '🏆',
    desc: 'MST: 0108743360',
  },
]

const galleryAssets = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

function galleryAsset(name) {
  return galleryAssets[`../assets/gallery/${name}`]
}

export const galleryData = [
  {
    id: 1,
    title: 'VHEC - Khoảnh Khắc Đáng Nhớ',
    description: 'Những khoảnh khắc gắn kết của đội ngũ VHEC trong hành trình 10 năm xây dựng và phát triển.',
    thumb: 'https://vhec.vn/dist/images/news/00.jpg',
    full: 'https://vhec.vn/dist/images/news/00.jpg',
  },
  {
    id: 2,
    title: 'Hoạt Động Nội Bộ VHEC',
    description: 'Các hoạt động gắn kết đội ngũ, xây dựng văn hóa doanh nghiệp đặc trưng của VHEC.',
    thumb: 'https://vhec.vn/dist/images/news/01.jpg',
    full: 'https://vhec.vn/dist/images/news/01.jpg',
  },
  {
    id: 3,
    title: 'Đội Ngũ VHEC',
    description: '80% kỹ sư tốt nghiệp từ Đại học Bách khoa Hà Nội, đội ngũ tinh nhuệ, tận tâm và chuyên nghiệp.',
    thumb: 'https://vhec.vn/dist/images/news/02.jpg',
    full: 'https://vhec.vn/dist/images/news/02.jpg',
  },
  {
    id: 4,
    title: 'Sự Kiện Và Hợp Tác',
    description: 'Các sự kiện, hội thảo và lễ ký kết hợp tác với đối tác trong nước và quốc tế.',
    thumb: 'https://vhec.vn/dist/images/news/03.jpg',
    full: 'https://vhec.vn/dist/images/news/03.jpg',
  },
  {
    id: 5,
    title: 'Công Nghệ Và Sáng Tạo',
    description: 'VHEC không ngừng đổi mới, ứng dụng công nghệ tiên tiến vào từng giải pháp cho khách hàng.',
    thumb: 'https://vhec.vn/dist/images/news/04.jpg',
    full: 'https://vhec.vn/dist/images/news/04.jpg',
  },
  {
    id: 6,
    title: 'Cùng Nhau Vươn Tầm',
    description: 'Tinh thần đồng đội, sẻ chia và cùng nhau phát triển là giá trị cốt lõi của VHEC suốt 10 năm.',
    thumb: 'https://vhec.vn/dist/images/news/05.jpg',
    full: 'https://vhec.vn/dist/images/news/05.jpg',
  },
  {
    id: 7,
    title: 'Tuyển Dụng Và Phát Triển Nhân Tài',
    description: 'VHEC luôn chào đón những kỹ sư tài năng, nhiệt huyết cùng xây dựng tương lai công nghệ Việt Nam.',
    thumb: 'https://vhec.vn/dist/images/logo/tuyendung.jpg',
    full: 'https://vhec.vn/dist/images/logo/tuyendung.jpg',
  },
  {
    id: 8,
    title: 'VHEC - 10 Năm Vươn Tầm',
    description: 'Một thập kỷ kiến tạo, từ Hà Nội đến Tokyo, từ startup đến đối tác công nghệ tin cậy hàng đầu.',
    thumb: 'https://vhec.vn/dist/images/background-primary.png',
    full: 'https://vhec.vn/dist/images/background-primary.png',
  },
  {
    id: 9,
    title: 'Tiệc Cuối Năm 2023',
    description: 'Khoảnh khắc mở màn của đêm Year End Party, nơi đại gia đình VHEC cùng nhìn lại một năm đáng nhớ.',
    thumb: galleryAsset('480816168_1051526757003242_3874282497509511251_n.jpg'),
    full: galleryAsset('480816168_1051526757003242_3874282497509511251_n.jpg'),
  },
  {
    id: 10,
    title: 'Khách Mời Đồng Hành',
    description: 'Những vị khách và đối tác thân thiết cùng xuất hiện trong không gian ấm áp của sự kiện cuối năm.',
    thumb: galleryAsset('481199369_1051526710336580_8912686663312822774_n.jpg'),
    full: galleryAsset('481199369_1051526710336580_8912686663312822774_n.jpg'),
  },
  {
    id: 11,
    title: 'Đại Gia Đình VHEC',
    description: 'Bức ảnh tập thể đầy năng lượng, ghi lại tinh thần đồng đội và sự gắn kết của VHEC.',
    thumb: galleryAsset('481663300_1051526713669913_1604029433164225694_n.jpg'),
    full: galleryAsset('481663300_1051526713669913_1604029433164225694_n.jpg'),
  },
  {
    id: 12,
    title: 'Khoảnh Khắc Sân Khấu',
    description: 'Những tràng cười, những cái vẫy tay và không khí bùng nổ trong đêm tiệc cuối năm.',
    thumb: galleryAsset('480998429_1051526967003221_6277085613656221406_n.jpg'),
    full: galleryAsset('480998429_1051526967003221_6277085613656221406_n.jpg'),
  },
  {
    id: 13,
    title: 'Tập Thể Rạng Rỡ',
    description: 'Một góc nhìn khác của đêm Year End Party với những gương mặt quen thuộc và nụ cười đầy tự hào.',
    thumb: galleryAsset('481271229_1051526950336556_2786648122883593987_n.jpg'),
    full: galleryAsset('481271229_1051526950336556_2786648122883593987_n.jpg'),
  },
  {
    id: 14,
    title: 'Khoảnh Khắc Gắn Kết',
    description: 'Mỗi khung hình đều là một kỷ niệm nhỏ góp lại thành hành trình lớn của đại gia đình VHEC.',
    thumb: galleryAsset('480783549_1051527027003215_9217681431683271138_n.jpg'),
    full: galleryAsset('480783549_1051527027003215_9217681431683271138_n.jpg'),
  },
  {
    id: 15,
    title: 'Nụ Cười Cuối Năm',
    description: 'Những nụ cười và ánh mắt rạng rỡ khép lại một năm nỗ lực bằng sự biết ơn và phấn khởi.',
    thumb: galleryAsset('481256315_1051526990336552_5974737995712033854_n.jpg'),
    full: galleryAsset('481256315_1051526990336552_5974737995712033854_n.jpg'),
  },
  {
    id: 16,
    title: 'Sân Khấu Kỷ Niệm',
    description: 'Không gian sự kiện được lấp đầy bởi tiếng cười, niềm vui và tinh thần hướng về chặng đường mới.',
    thumb: galleryAsset('0013_481022405_1051526880336563_8124056833592.jpg'),
    full: galleryAsset('0013_481022405_1051526880336563_8124056833592.jpg'),
  },
  {
    id: 17,
    title: 'Khoảnh Khắc Lưu Niệm',
    description: 'Một bức ảnh tập thể đáng nhớ, lưu lại sự đồng hành của những thành viên trong đêm tiệc cuối năm.',
    thumb: galleryAsset('0014_481006559_1051526897003228_9187850961710.jpg'),
    full: galleryAsset('0014_481006559_1051526897003228_9187850961710.jpg'),
  },
  {
    id: 18,
    title: 'Trung Thu 2024',
    description: 'Không khí Trung Thu ấm áp và rộn ràng với những hoạt động gắn kết tại văn phòng VHEC.',
    thumb: galleryAsset('480619016_1044773437678574_3602015736658462855_n.jpg'),
    full: galleryAsset('480619016_1044773437678574_3602015736658462855_n.jpg'),
  },
  {
    id: 19,
    title: 'Mùa Trăng Gắn Kết',
    description: 'Những khoảnh khắc gần gũi, vui tươi và đầy màu sắc của tập thể VHEC trong dịp Trung Thu.',
    thumb: galleryAsset('480391230_1044773577678560_6137644130970685956_n.jpg'),
    full: galleryAsset('480391230_1044773577678560_6137644130970685956_n.jpg'),
  },
  {
    id: 20,
    title: 'Summer Trip 2024',
    description: 'Bức ảnh mở đầu cho hành trình mùa hè đầy năng lượng của đại gia đình VHEC tại Phú Quốc.',
    thumb: galleryAsset('0009_480463481_1044010037754914_6480873512708.jpg'),
    full: galleryAsset('0009_480463481_1044010037754914_6480873512708.jpg'),
  },
  {
    id: 21,
    title: 'Check-in Cùng Nhau',
    description: 'Cả team cùng check-in, lưu lại cảm giác háo hức trước những trải nghiệm mới trên hành trình hè.',
    thumb: galleryAsset('0010_480276015_1044010144421570_2782923329280.jpg'),
    full: galleryAsset('0010_480276015_1044010144421570_2782923329280.jpg'),
  },
  {
    id: 22,
    title: 'Năng Lượng Mùa Hè',
    description: 'Một khung hình mang đúng tinh thần summer trip: tươi vui, cởi mở và đầy kết nối.',
    thumb: galleryAsset('0011_480502097_1044010171088234_3251442155222.jpg'),
    full: galleryAsset('0011_480502097_1044010171088234_3251442155222.jpg'),
  },
  {
    id: 23,
    title: 'Kỷ Niệm Bên Nhau',
    description: 'Những bước chân cùng nhau đi qua tạo nên những ký ức đẹp không chỉ trong công việc mà cả đời sống tập thể.',
    thumb: galleryAsset('0012_480796374_1044010044421580_4568977854110.jpg'),
    full: galleryAsset('0012_480796374_1044010044421580_4568977854110.jpg'),
  },
  {
    id: 24,
    title: 'Hành Trình Kết Nối',
    description: 'Mỗi chuyến đi là thêm một lần hiểu nhau hơn, gần nhau hơn và làm dày thêm tinh thần đồng đội của VHEC.',
    thumb: galleryAsset('0013_480271080_1044010047754913_1932856543990.jpg'),
    full: galleryAsset('0013_480271080_1044010047754913_1932856543990.jpg'),
  },
  {
    id: 25,
    title: 'Khoảnh Khắc Đồng Hành',
    description: 'Một góc ảnh nhẹ nhàng nhưng rất đậm chất VHEC: đồng hành, sẻ chia và cùng nhau tận hưởng hành trình.',
    thumb: galleryAsset('480478726_1044010064421578_8963556843736812189_n.jpg'),
    full: galleryAsset('480478726_1044010064421578_8963556843736812189_n.jpg'),
  },
]

export const messagesData = [
  {
    id: 1,
    name: 'Pham Van Tuan',
    role: 'Giam doc dieu hanh - VHEC',
    avatar: 'https://i.pravatar.cc/150?img=11',
    message:
      '10 nam qua, VHEC da hien thuc hoa su menh "Applying Advanced Engineering Technology to Elevate the Value of Life". Tu nhung ky su Bach khoa day dam me, hom nay chung ta la doi tac cong nghe tin cay cua Nhat Ban. Cam on tung thanh vien, hanh trinh van con tiep dien.',
    tag: 'CEO',
  },
  {
    id: 2,
    name: 'Phan Trong Bien',
    role: 'Thanh vien VHEC',
    avatar: 'https://i.pravatar.cc/150?img=53',
    message:
      '10 nam gan bo voi VHEC la 10 nam toi khong ngung hoc hoi, phat trien va truong thanh. Moi du an, moi dong nghiep deu de lai dau an sau dam. Tu hao la mot phan cua gia dinh VHEC, chuc mung sinh nhat 10 nam.',
    tag: 'VHEC',
  },
  {
    id: 3,
    name: 'Nguyen Van Khoe',
    role: 'Thanh vien VHEC',
    avatar: 'https://i.pravatar.cc/150?img=60',
    message:
      'VHEC khong chi la noi lam viec, day la noi toi tim thay dam me va y nghia trong tung dong code, tung giai phap cong nghe. 10 nam qua la hanh trinh dang tu hao. Chuc cong ty ngay cang vuon xa, chinh phuc nhung dinh cao moi.',
    tag: 'VHEC',
  },
  {
    id: 4,
    name: 'Nguyen Quoc Trang',
    role: 'Thanh vien VHEC',
    avatar: 'https://i.pravatar.cc/150?img=57',
    message:
      'Nhung ky niem cung nhau vuot qua deadline gap, cung nhau an mung khi du an thanh cong la VHEC trong toi. Cam on ban lanh dao va tat ca anh chi em dong nghiep. Chuc mung 10 nam thanh lap, VHEC muon nam.',
    tag: 'VHEC',
  },
  {
    id: 5,
    name: 'Ngo Duc Kien',
    role: 'Thanh vien VHEC',
    avatar: 'https://i.pravatar.cc/150?img=63',
    message:
      'Lam viec voi cac doi tac Nhat Ban dang cap the gioi nhu Hitachi, Nissan da ren giua toi tro thanh ky su chuyen nghiep hon. VHEC da cho toi co hoi do. 10 nam la mot nen mong vung chac de chung ta cung bay cao hon nua.',
    tag: 'VHEC',
  },
  {
    id: 6,
    name: 'Luu Cong Thin',
    role: 'Thanh vien VHEC',
    avatar: 'https://i.pravatar.cc/150?img=68',
    message:
      'Nhin lai hanh trinh tu ngay dau thanh lap den hom nay, toi thay VHEC da lon manh khong ngung nho tinh than doan ket va khong ngai kho cua tung thanh vien. Chuc mung ky niem 10 nam vi mot VHEC ngay cang phat trien ben vung.',
    tag: 'VHEC',
  },
]

export const sampleLeaderboard = [
  { id: 1, name: 'Vu Manh Truong', score: 3200, time: '2026-04-02T08:30:00Z' },
  { id: 2, name: 'Do Duc Manh', score: 2950, time: '2026-04-02T09:15:00Z' },
  { id: 3, name: 'Duong Trong Nghia', score: 2800, time: '2026-04-02T10:00:00Z' },
  { id: 4, name: 'Nguyen Tan Nhut', score: 2750, time: '2026-04-02T08:45:00Z' },
  { id: 5, name: 'Vo Thanh Phong', score: 2600, time: '2026-04-02T11:20:00Z' },
  { id: 6, name: 'Doan Trong Tien', score: 2450, time: '2026-04-02T13:30:00Z' },
]
