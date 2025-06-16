import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  en: {
    translation: {
      // Header Navigation
      "nav.home": "Home",
      "nav.about": "About Us",
      "nav.donationProcess": "Donation Process",
      "nav.upcomingDrives": "Upcoming Drives",
      "nav.contact": "Contact",
      "nav.login": "LOGIN",
      "nav.logout": "LOGOUT",
      "nav.welcome": "Welcome, {{name}}!",
      "nav.loading": "Loading...",
      "nav.adminPanel": "Admin Panel",
      "nav.profile": "Profile",
      "nav.bloodRequests": "Blood Requests",
      "nav.donateBlood": "Donate Blood",
      "nav.donationHistory": "Donation History",

      // Profile Page
      "profile.title": "Profile Settings",
      "profile.name": "Name",
      "profile.email": "Email",
      "profile.bloodGroup": "Blood Group",
      "profile.location": "Location",
      "profile.locationPlaceholder": "Enter your city",
      "profile.selectBloodGroup": "Select blood group",
      "profile.updateButton": "Update Profile",
      "profile.updating": "Updating...",
      "profile.loading": "Loading profile...",
      "profile.updateSuccess": "Profile updated successfully!",
      "profile.blood.hint":
        "Choose your blood type. This information is important for matching with donation needs.",
      "profile.city.hint":
        "Enter a city name. The location will be automatically geocoded.",
      "profile.updating": "Updating...",
      "profile.update": "Update profile",

      // Admin Panel
      "admin.authError": "auth Error",
      "admin.fetchError": "fetch Error",
      "admin.updateError": "update Error",
      "admin.confirmDelete": "Do you want to delete this user",
      "admin.deleteError": "Error deleting user. Please try again.",
      "admin.loading": "Loading admin panel...",
      "admin.title": "Admin Panel",
      "admin.description": "Manage users and donations",
      "admin.users.title": "Management Board",
      "admin.users.name": "Name",
      "admin.users.email": "Email",
      "admin.users.role": "Role",
      "admin.users.actions": "Actions",
      "admin.users.search": "Search",
      "admin.users.sortBy": "Sort",
      "admin.users.noUsers": "No users found",
      "admin.users.delete": "Delete",
      "admin.users.role.admin": "Admin",
      "admin.users.role.staff": "Staff",
      "admin.users.role.member": "Member",
      "admin.confirmRoleChange":
        "Are you sure you want to change this user's role to {{role}}?",

      //Cần thiết thì thêm vào adminpanel để dùng
      // "admin.users.changeRole": "Change Role",
      // "admin.users.updateSuccess": "User role updated successfully!",
      // "admin.error": "Error loading admin data. Please try again later.",
      // "admin.deleteSuccess": "User deleted successfully!",
      // "admin.deleteError": "Error deleting user. Please try again.",
      // "admin.deleteButton": "Delete User",
      // "admin.deleteConfirm": "Are you sure you want to delete this user?",
      // "admin.deleteConfirmYes": "Yes, delete",
      // "admin.deleteConfirmNo": "No, cancel",
      // "admin.deleteUser": "Delete User",
      // "admin.users.update": "Update Role",
      // "admin.users.updateButton": "Update Role",
      // "admin.users.updateError": "Error updating user role. Please try again.",
      // "admin.users.updateSuccess": "User role updated successfully!",
      // "admin.users.changeRoleError":
      //   "Error changing user role. Please try again.",

      // Home Page
      "home.hero.title": "Give the Gift of Life",
      "home.hero.subtitle2": "Your Blood Can Save Lives",
      "home.hero.subtitle":
        "Every day, thousands of people need blood transfusions to survive. Your donation can make a significant difference in someone's life.",
      "home.hero.donateButton": "Donate Now",
      "home.hero.learnMore": "Learn More", // Benefits Section
      "benefits.title": "Benefits of Donating Blood",
      "benefits.subtitle": "Discover how your donation can make a difference",
      "benefits.health.title": "Save Up to 3 Lives",
      "benefits.health.description":
        "A single blood donation can help save up to three lives. Your donation is separated into red blood cells, plasma, and platelets, each helping different patients.",
      "benefits.screening.title": "Free Health Screening",
      "benefits.screening.description":
        "Every donation includes a mini-physical with blood pressure, temperature, pulse, and hemoglobin level checks - completely free of charge.",
      "benefits.community.title": "Reduce Health Risks",
      "benefits.community.description":
        "Regular blood donation may help maintain healthy iron levels and reduce oxidative stress in your body, promoting better overall health.",
      "benefits.emergency.title": "Boost Cardiovascular Health",
      "benefits.emergency.description":
        "Donating blood can help improve blood flow and reduce the risk of heart disease by maintaining healthy iron levels.",
      "benefits.renewal.title": "Regular Blood Renewal",
      "benefits.renewal.description":
        "Donating blood promotes the production of new blood cells, helping your body maintain healthy blood cell levels.",
      "benefits.hemochromatosis.title": "Reduces Risk of Hemochromatosis",
      "benefits.hemochromatosis.description":
        "Regular blood donation can help reduce iron overload and decrease the risk of hemochromatosis, especially in men.",
      // Blood Types Section
      "bloodTypes.title": "Blood Types & Compatibility",
      "bloodTypes.description":
        "Understanding blood types is crucial for successful transfusions. Here's a quick guide to blood type compatibility.",
      "bloodTypes.canDonateTo": "Can donate to:",
      "bloodTypes.canReceiveFrom": "Can receive from:",
      "bloodTypes.universalDonor": "Universal Donor",
      "bloodTypes.allTypes": "All Blood Types",
      "bloodTypes.aPlus.donateTo": "A+, AB+",
      "bloodTypes.aPlus.receiveFrom": "A+, A-, O+, O-",
      "bloodTypes.aMinus.donateTo": "A+, A-, AB+, AB-",
      "bloodTypes.aMinus.receiveFrom": "A-, O-",
      "bloodTypes.bPlus.donateTo": "B+, AB+",
      "bloodTypes.bPlus.receiveFrom": "B+, B-, O+, O-",
      "bloodTypes.bMinus.donateTo": "B+, B-, AB+, AB-",
      "bloodTypes.bMinus.receiveFrom": "B-, O-",
      "bloodTypes.abPlus.donateTo": "AB+ only",
      "bloodTypes.abPlus.receiveFrom": "All Blood Types",
      "bloodTypes.abMinus.donateTo": "AB+, AB-",
      "bloodTypes.abMinus.receiveFrom": "A-, B-, AB-, O-",
      "bloodTypes.oPlus.donateTo": "A+, B+, AB+, O+",
      "bloodTypes.oPlus.receiveFrom": "O+, O-",
      "bloodTypes.oMinus.donateTo": "All Blood Types",
      "bloodTypes.oMinus.receiveFrom": "O- only",

      // Donation Process Section
      "donationProcess.title": "The Donation Process",
      "donationProcess.description":
        "Donating blood is a simple and straightforward process that takes about an hour from start to finish.",
      "donationProcess.step1.title": "Registration",
      "donationProcess.step1.description":
        "Present ID and answer basic health questions",
      "donationProcess.step2.title": "Health Screening",
      "donationProcess.step2.description":
        "Quick physical (temperature, blood pressure, pulse, hemoglobin)",
      "donationProcess.step3.title": "Blood Donation",
      "donationProcess.step3.description":
        "The actual donation takes only 8-10 minutes",
      "donationProcess.step4.title": "Refreshments",
      "donationProcess.step4.description":
        "Rest and enjoy snacks to replenish fluids and energy",

      // Testimonials Section
      "testimonials.title": "Donor Testimonials",
      "testimonials.quote1":
        "I've been donating blood for over 10 years now. It's just an hour of my time, but it means the world to someone in need.",
      "testimonials.author1": "- Sarah Johnson",
      "testimonials.quote2":
        "After my son's accident, he needed multiple transfusions. Now I donate regularly to give back and help others like him.",
      "testimonials.author2": "- Michael Rodriguez",
      "testimonials.quote3":
        "It's such a simple way to make a big difference. I feel great knowing my donation directly helps save lives!",
      "testimonials.author3": "- Priya Patel",

      // CTA Section
      "cta.title": "Ready to Make a Difference?",
      "cta.description":
        "Schedule your blood donation appointment today and join our community of lifesavers.",
      "cta.button": "Donate Now",

      // Footer
      "footer.about": "About LifeSource",
      "footer.aboutText":
        "LifeSource is dedicated to connecting blood donors with those in need, making it easier than ever to save lives through voluntary blood donation.",
      "footer.quickLinks": "Quick Links",
      "footer.contact": "Contact Info",
      "footer.address": "123 Medical Center Dr, Healthcare City, HC 12345",
      "footer.phone": "Phone: (555) 123-4567",
      "footer.email": "Email: info@lifesource.com",
      "footer.rights": "© 2024 LifeSource. All rights reserved.",
      // Login Page
      "login.title": "Welcome to LifeSource",
      "login.subtitle":
        "🌟 Join our mission to save lives through blood donation. Sign in with your Google account to get started!",
      "login.googleButton": " Login with Google",
      "login.redirecting": "⏳ Redirecting...",
      "login.privacy":
        "🔒 By signing in, you agree to our terms of service and privacy policy. Your data is secure and protected.",
      "login.divider": "Or continue with email",
      "login.email": "Email Address",
      "login.password": "Password",
      "login.loginButton": "Sign In",
      "login.noAccount": "Don't have an account?",
      "login.signUp": "Sign up here",
      // Contact Page
      "contact.title": "Get in Touch",
      "contact.subtitle":
        "Have questions about blood donation? We're here to help.",
      "contact.getInTouch": "Get in Touch with LifeSource",
      "contact.phone": "Phone",
      "contact.email": "Email",
      "contact.location": "Location",
      "contact.hours": "Monday - Friday: 8:00 AM - 6:00 PM",
      "contact.sendMessage": "Send Us a Message",
      "contact.responseTime": "We'll get back to you as soon as possible",
      "contact.form.name": "Your Name",
      "contact.form.email": "Email Address",
      "contact.form.subject": "Subject",
      "contact.form.message": "Message",
      "contact.form.submit": "Send Message",
      "contact.info.title": "Contact Information",
      "contact.info.description":
        "Reach out to us through any of the following methods:",

      // Donate Page
      "donate.title": "Blood Donation Registration",
      "donate.description":
        "Please fill out the form below to register your blood donation.",
      "donate.date": "Donation Date",
      "donate.bloodType": "Blood Type",
      "donate.units": "Amount (units)",
      "donate.donationType": "Donation Type",
      "donate.type.wholeblood": "Whole Blood",
      "donate.type.apheresis": "Apheresis",
      "donate.type.superred": "SuperRed",
      "donate.type.platelet": "Platelet",
      "donate.type.plasma": "Plasma",
      "donate.submit": "Register Donation",
      "donate.success": "Registration successful!",
      "donate.submitError": "Failed to register donation",

      // Language Switcher
      "language.switch": "Language",
      "language.english": "English",
      "language.vietnamese": "Tiếng Việt", // Legal Pages
      "legal.terms.title": "Terms of Service",
      "legal.terms.content": "Terms of Service content goes here...",
      "legal.privacy.title": "Privacy Policy",
      "legal.privacy.content": "Privacy Policy content goes here...",

      // Need Request
      "needRequest.title": "Blood Need Request",
      "needRequest.description":
        "Request blood donations for patients in need. Our community of donors is ready to help.",
      "needRequest.bloodGroup": "Blood Group",
      "needRequest.selectBloodGroup": "Select blood group",
      "needRequest.component": "Blood Component",
      "needRequest.selectComponent": "Select component",
      "needRequest.units": "Units Required",
      "needRequest.reason": "Reason for Request",
      "needRequest.reasonPlaceholder":
        "Please explain why this blood is needed (e.g., surgery, accident, ongoing treatment)",
      "needRequest.submit": "Submit Request",
      "needRequest.submitting": "Submitting...",
      "needRequest.successMessage":
        "Your blood request has been submitted successfully. Our team will process it as soon as possible.",
      "needRequest.submitError":
        "Error submitting your request. Please try again.",

      "needRequest.listTitleAll": "All Blood Need Requests",
      "needRequest.listTitleMy": "My Blood Need Requests",
      "needRequest.filterByStatus": "Filter by Status",
      "needRequest.allStatuses": "All Statuses",
      "needRequest.status.open": "Open",
      "needRequest.status.fulfilled": "Fulfilled",
      "needRequest.status.expired": "Expired",
      "needRequest.noRequests": "No blood requests found",
      "needRequest.bloodRequestType": "Request type",
      "needRequest.unit": "Unit",
      "needRequest.units": "Units",
      "needRequest.markFulfilled": "Mark as Fulfilled",
      "needRequest.markExpired": "Mark as Expired",
      "needRequest.confirmDelete":
        "Are you sure you want to delete this request?",
      "needRequest.deleteError": "Error deleting request",
      "needRequest.updateError": "Error updating request status",
      "needRequest.fetchError": "Error fetching blood requests",
      "needRequest.component.wholeblood": "Whole Blood",
      "needRequest.component.plasma": "Plasma",
      "needRequest.component.platelets": "Platelets",
      "needRequest.component.redcells": "Red Cells",
      "needRequest.nav.createRequest": "Create Request",
      "needRequest.nav.viewRequests": "View Requests",
      "needRequest.nav.viewAllRequests": "View All Requests",
      "needRequest.nav.viewMyRequests": "View My Requests",
      "needRequest.memberNotice":
        "As a member, you can only see your own blood donation requests.",

      //common stuff
      "common.delete": "Delete",
      "common.submitting": "Submitting...",
      "common.notAuthenticated": "Not authenticated",
      "common.refresh": "Refresh",
      "common.loading": "Loading...",

      // Donate Request
      "donateRequest.title": "Blood Donation Registration",
      "donateRequest.description":
        "Register to donate blood and help save lives. Your donation can make a difference.",
      "donateRequest.bloodGroup": "Blood Group",
      "donateRequest.selectBloodGroup": "Select blood group",
      "donateRequest.component": "Blood Component",
      "donateRequest.selectComponent": "Select component",
      "donateRequest.donationDate": "Preferred Donation Date",
      "donateRequest.submit": "Submit Registration",
      "donateRequest.submitting": "Submitting...",
      "donateRequest.successMessage":
        "Your donation registration has been submitted successfully. Our team will contact you soon.",
      "donateRequest.submitError":
        "Error submitting your registration. Please try again.",

      "donateRequest.listTitleAll": "All Donation Registrations",
      "donateRequest.listTitleMy": "My Donation Registrations",
      "donateRequest.filterByStatus": "Filter by Status",
      "donateRequest.allStatuses": "All Statuses",
      "donateRequest.status.open": "Open",
      "donateRequest.status.approved": "Approved",
      "donateRequest.status.completed": "Completed",
      "donateRequest.status.cancelled": "Cancelled",
      "donateRequest.status.pending": "Pending",
      "donateRequest.status.rejected": "Rejected",
      "donateRequest.markRejected": "Mark as Rejected",
      "donateRequest.noRequests": "No donation registrations found",
      "donateRequest.donationType": "Donation type",
      "donateRequest.markApproved": "Mark as Approved",
      "donateRequest.markCompleted": "Mark as Completed",
      "donateRequest.markCancelled": "Mark as Cancelled",
      "donateRequest.confirmDelete":
        "Are you sure you want to delete this registration?",
      "donateRequest.deleteError": "Error deleting registration",
      "donateRequest.updateError": "Error updating registration status",
      "donateRequest.fetchError": "Error fetching donation registrations",
      "donateRequest.component.wholeblood": "Whole Blood",
      "donateRequest.component.plasma": "Plasma",
      "donateRequest.component.platelets": "Platelets",
      "donateRequest.component.redcells": "Red Cells",
      "donateRequest.nav.createRequest": "Register Donation",
      "donateRequest.nav.viewRequests": "View Registrations",
      "donateRequest.nav.viewAllRequests": "View All Registrations",
      "donateRequest.nav.viewMyRequests": "View My Registrations",
      "donateRequest.memberNotice":
        "As a member, you can only see your own donation registrations.",

      "donateRequest.historyTitleAll": "Blood donation history",
      "donateRequest.historyTitleMy": "My blood donation history",
      "donateRequest.createdAt": "Created at",
      "donateRequest.completedAt": "Completed at",
      "donateRequest.rejectionReason": "Reason for rejection",
    },
  },
  vi: {
    translation: {
      // Header Navigation
      "nav.home": "Trang Chủ",
      "nav.about": "Về Chúng Tôi",
      "nav.donationProcess": "Quy Trình Hiến Máu",
      "nav.upcomingDrives": "Chương Trình Sắp Tới",
      "nav.contact": "Liên Hệ",
      "nav.login": "ĐĂNG NHẬP",
      "nav.logout": "ĐĂNG XUẤT",
      "nav.welcome": "Chào mừng, {{name}}!",
      "nav.loading": "Đang tải...",
      "nav.adminPanel": "Quản Trị",
      "nav.profile": "Hồ Sơ",
      "nav.bloodRequests": "Yêu Cầu Hiến Máu",
      "nav.donateBlood": "Hiến Máu",
      "nav.donationHistory": "Lịch Sử Hiến Máu",

      // Profile Page
      "profile.title": "Cài Đặt Hồ Sơ",
      "profile.name": "Tên",
      "profile.email": "Email",
      "profile.bloodGroup": "Nhóm Máu",
      "profile.location": "Địa Điểm",
      "profile.locationPlaceholder": "Nhập tên thành phố của bạn",
      "profile.selectBloodGroup": "Chọn nhóm máu",
      "profile.updateButton": "Cập Nhật Hồ Sơ",
      "profile.updating": "Đang cập nhật...",
      "profile.loading": "Đang tải hồ sơ...",
      "profile.updateSuccess": "Cập nhật hồ sơ thành công!",
      "profile.blood.hint":
        "Chọn nhóm máu của bạn. Thông tin này rất quan trọng để phù hợp với nhu cầu hiến tặng.",
      "profile.city.hint":
        "Nhập tên thành phố. Vị trí sẽ được tự động mã hóa địa lý.",
      "profile.updating": "Đang cập nhật....",
      "profile.update": "Cập nhật thông tin",

      // Admin Panel
      "admin.authError": "Lỗi xác thực",
      "admin.fetchError": "Lỗi khi lấy dữ liệu",
      "admin.updateError": "Lỗi khi cập nhật vai trò",
      "admin.confirmDelete": "Bạn có chắc chắn muốn xóa người dùng này không?",
      "admin.deleteError": "Lỗi khi xóa người dùng. Vui lòng thử lại.",
      "admin.loading": "Đang tải bảng quản trị...",
      "admin.title": "Bảng Quản Trị",
      "admin.description": "Quản lý người dùng và các khoản hiến máu",
      "admin.users.title": "Bảng Quản Lý",
      "admin.users.name": "Họ tên",
      "admin.users.email": "Email",
      "admin.users.role": "Vai trò",
      "admin.users.actions": "Hành động",
      "admin.users.search": "Tìm kiếm",
      "admin.users.sortBy": "Sắp xếp",
      "admin.users.noUsers": "Không tìm thấy người dùng nào",
      "admin.users.delete": "Xóa",
      "admin.users.role.admin": "Quản trị viên",
      "admin.users.role.staff": "Nhân viên",
      "admin.users.role.member": "Thành viên",
      "admin.confirmRoleChange":
        "Bạn có chắc muốn thay đổi vai trò của người dùng này thành {{role}} không?",

      // Home Page
      "home.hero.title": "Tặng Món Quà Của Sự Sống",
      "home.hero.subtitle2": "Máu Của Bạn Có Thể Cứu Sống",
      "home.hero.subtitle":
        "Mỗi ngày, hàng ngàn người cần truyền máu để sống sót. Việc hiến máu của bạn có thể tạo ra sự khác biệt đáng kể trong cuộc sống của ai đó.",
      "home.hero.donateButton": "Hiến Máu Ngay",
      "home.hero.learnMore": "Tìm Hiểu Thêm",
      // Benefits Section
      "benefits.title": "Lợi Ích Của Việc Hiến Máu",
      "benefits.subtitle":
        "Khám phá cách hiến máu của bạn có thể tạo ra sự khác biệt",
      "benefits.health.title": "Cứu Tới 3 Mạng Sống",
      "benefits.health.description":
        "Một lần hiến máu có thể giúp cứu tới ba mạng sống. Máu hiến của bạn được tách thành hồng cầu, huyết tương và tiểu cầu, mỗi thành phần giúp đỡ các bệnh nhân khác nhau.",
      "benefits.screening.title": "Khám Sức Khỏe Miễn Phí",
      "benefits.screening.description":
        "Mỗi lần hiến máu bao gồm kiểm tra sức khỏe cơ bản với huyết áp, nhiệt độ, mạch và mức hemoglobin - hoàn toàn miễn phí.",
      "benefits.community.title": "Giảm Rủi Ro Sức Khỏe",
      "benefits.community.description":
        "Hiến máu thường xuyên có thể giúp duy trì mức sắt khỏe mạnh và giảm stress oxy hóa trong cơ thể, thúc đẩy sức khỏe tổng thể tốt hơn.",
      "benefits.emergency.title": "Tăng Cường Sức Khỏe Tim Mạch",
      "benefits.emergency.description":
        "Hiến máu có thể giúp cải thiện lưu lượng máu và giảm nguy cơ bệnh tim bằng cách duy trì mức sắt khỏe mạnh.",
      // Blood Types Section
      "bloodTypes.title": "Nhóm Máu & Tương Thích",
      "bloodTypes.description":
        "Hiểu về nhóm máu là rất quan trọng cho việc truyền máu thành công. Đây là hướng dẫn nhanh về tính tương thích của nhóm máu.",
      "bloodTypes.canDonateTo": "Có thể hiến cho:",
      "bloodTypes.canReceiveFrom": "Có thể nhận từ:",
      "bloodTypes.universalDonor": "Người Cho Máu Toàn Cầu",
      "bloodTypes.allTypes": "Tất Cả Nhóm Máu",
      "bloodTypes.aPlus.donateTo": "A+, AB+",
      "bloodTypes.aPlus.receiveFrom": "A+, A-, O+, O-",
      "bloodTypes.aMinus.donateTo": "A+, A-, AB+, AB-",
      "bloodTypes.aMinus.receiveFrom": "A-, O-",
      "bloodTypes.bPlus.donateTo": "B+, AB+",
      "bloodTypes.bPlus.receiveFrom": "B+, B-, O+, O-",
      "bloodTypes.bMinus.donateTo": "B+, B-, AB+, AB-",
      "bloodTypes.bMinus.receiveFrom": "B-, O-",
      "bloodTypes.abPlus.donateTo": "Chỉ AB+",
      "bloodTypes.abPlus.receiveFrom": "Tất Cả Nhóm Máu",
      "bloodTypes.abMinus.donateTo": "AB+, AB-",
      "bloodTypes.abMinus.receiveFrom": "A-, B-, AB-, O-",
      "bloodTypes.oPlus.donateTo": "A+, B+, AB+, O+",
      "bloodTypes.oPlus.receiveFrom": "O+, O-",
      "bloodTypes.oMinus.donateTo": "Tất Cả Nhóm Máu",
      "bloodTypes.oMinus.receiveFrom": "Chỉ O-",

      // Donation Process Section
      "donationProcess.title": "Quy Trình Hiến Máu",
      "donationProcess.description":
        "Hiến máu là một quy trình đơn giản và dễ hiểu, mất khoảng một giờ từ đầu đến cuối.",
      "donationProcess.step1.title": "Đăng Ký",
      "donationProcess.step1.description":
        "Xuất trình CMND và trả lời các câu hỏi sức khỏe cơ bản",
      "donationProcess.step2.title": "Kiểm Tra Sức Khỏe",
      "donationProcess.step2.description":
        "Khám nhanh (nhiệt độ, huyết áp, mạch, hemoglobin)",
      "donationProcess.step3.title": "Hiến Máu",
      "donationProcess.step3.description":
        "Việc hiến máu thực tế chỉ mất 8-10 phút",
      "donationProcess.step4.title": "Nghỉ Ngơi",
      "donationProcess.step4.description":
        "Nghỉ ngơi và thưởng thức đồ ăn nhẹ để bổ sung chất lỏng và năng lượng",

      // Testimonials Section
      "testimonials.title": "Lời Chứng Thực Từ Người Hiến Máu",
      "testimonials.quote1":
        "Tôi đã hiến máu hơn 10 năm nay. Chỉ mất một giờ của tôi, nhưng có ý nghĩa rất lớn đối với ai đó đang cần.",
      "testimonials.author1": "- Sarah Johnson",
      "testimonials.quote2":
        "Sau tai nạn của con trai tôi, cậu ấy cần nhiều lần truyền máu. Giờ tôi hiến máu thường xuyên để đền đáp và giúp đỡ những người khác như cậu ấy.",
      "testimonials.author2": "- Michael Rodriguez",
      "testimonials.quote3":
        "Đây là cách đơn giản để tạo ra sự khác biệt lớn. Tôi cảm thấy tuyệt vời khi biết việc hiến máu của mình trực tiếp giúp cứu sống!",
      "testimonials.author3": "- Priya Patel",

      // CTA Section
      "cta.title": "Sẵn Sàng Tạo Ra Sự Khác Biệt?",
      "cta.description":
        "Lên lịch cuộc hẹn hiến máu của bạn ngay hôm nay và tham gia cộng đồng những người cứu sống.",
      "cta.button": "Hiến Máu Ngay",

      // Footer
      "footer.about": "Về LifeSource",
      "footer.aboutText":
        "LifeSource tận tâm kết nối những người hiến máu với những người cần thiết, giúp việc cứu sống thông qua hiến máu tình nguyện trở nên dễ dàng hơn bao giờ hết.",
      "footer.quickLinks": "Liên Kết Nhanh",
      "footer.contact": "Thông Tin Liên Hệ",
      "footer.address": "123 Đường Trung Tâm Y Tế, Thành Phố Y Tế, YT 12345",
      "footer.phone": "Điện thoại: (555) 123-4567",
      "footer.email": "Email: info@lifesource.com",
      "footer.rights": "© 2024 LifeSource. Tất cả quyền được bảo lưu.",
      // Login Page
      "login.title": "Chào Mừng Đến Với LifeSource",
      "login.subtitle":
        "🌟 Tham gia sứ mệnh cứu sống thông qua hiến máu. Đăng nhập bằng tài khoản Google để bắt đầu!",
      "login.googleButton": " Đăng Nhập Với Google",
      "login.redirecting": "⏳ Đang chuyển hướng...",
      "login.privacy":
        "🔒 Bằng việc đăng nhập, bạn đồng ý với điều khoản dịch vụ và chính sách bảo mật của chúng tôi. Dữ liệu của bạn được bảo mật và bảo vệ.",
      "login.divider": "Hoặc tiếp tục với email",
      "login.email": "Địa Chỉ Email",
      "login.password": "Mật Khẩu",
      "login.loginButton": "Đăng Nhập",
      "login.noAccount": "Chưa có tài khoản?",
      "login.signUp": "Đăng ký tại đây",
      // Contact Page
      "contact.title": "Liên Hệ",
      "contact.subtitle": "Có câu hỏi về hiến máu? Chúng tôi sẵn sàng giúp đỡ.",
      "contact.getInTouch": "Liên Hệ Với LifeSource",
      "contact.phone": "Điện Thoại",
      "contact.email": "Email",
      "contact.location": "Địa Điểm",
      "contact.hours": "Thứ Hai - Thứ Sáu: 8:00 AM - 6:00 PM",
      "contact.sendMessage": "Gửi Tin Nhắn Cho Chúng Tôi",
      "contact.responseTime": "Chúng tôi sẽ phản hồi bạn sớm nhất có thể",
      "contact.form.name": "Tên Của Bạn",
      "contact.form.email": "Địa Chỉ Email",
      "contact.form.subject": "Chủ Đề",
      "contact.form.message": "Tin Nhắn",
      "contact.form.submit": "Gửi Tin Nhắn",
      "contact.info.title": "Thông Tin Liên Hệ",
      "contact.info.description":
        "Liên hệ với chúng tôi qua bất kỳ phương thức nào sau đây:",

      // Donate Page
      "donate.title": "Đăng ký hiến máu",
      "donate.description":
        "Vui lòng điền vào biểu mẫu dưới đây để đăng ký hiến máu.",
      "donate.date": "Ngày hiến máu",
      "donate.bloodType": "Nhóm máu",
      "donate.units": "Số lượng (đơn vị)",
      "donate.donationType": "Loại hiến máu",
      "donate.type.wholeblood": "Máu toàn phần",
      "donate.type.apheresis": "Apheresis",
      "donate.type.superred": "SuperRed",
      "donate.type.platelet": "Tiểu cầu",
      "donate.type.plasma": "Huyết tương",
      "donate.submit": "Đăng ký hiến máu",
      "donate.success": "Đăng ký thành công!",
      "donate.submitError": "Đăng ký hiến máu thất bại",

      // Language Switcher
      "language.switch": "Ngôn Ngữ",
      "language.english": "English",
      "language.vietnamese": "Tiếng Việt", // Legal Pages
      "legal.terms.title": "Điều Khoản Dịch Vụ",
      "legal.terms.content": "Nội dung Điều Khoản Dịch Vụ ở đây...",
      "legal.privacy.title": "Chính Sách Bảo Mật",
      "legal.privacy.content": "Nội dung Chính Sách Bảo Mật ở đây...",

      // Need Request
      "needRequest.title": "Yêu Cầu Hiến Máu",
      "needRequest.description":
        "Yêu cầu hiến máu cho bệnh nhân cần giúp đỡ. Cộng đồng người hiến máu của chúng tôi sẵn sàng hỗ trợ.",
      "needRequest.bloodGroup": "Nhóm Máu",
      "needRequest.selectBloodGroup": "Chọn nhóm máu",
      "needRequest.component": "Thành Phần Máu",
      "needRequest.selectComponent": "Chọn thành phần",
      "needRequest.units": "Số Lượng Đơn Vị",
      "needRequest.reason": "Lý Do Yêu Cầu",
      "needRequest.reasonPlaceholder":
        "Vui lòng giải thích lý do cần máu (ví dụ: phẫu thuật, tai nạn, điều trị liên tục)",
      "needRequest.submit": "Gửi Yêu Cầu",
      "needRequest.submitting": "Đang gửi...",
      "needRequest.successMessage":
        "Yêu cầu hiến máu của bạn đã được gửi thành công. Đội ngũ của chúng tôi sẽ xử lý nhanh nhất có thể.",
      "needRequest.submitError": "Lỗi khi gửi yêu cầu. Vui lòng thử lại.",

      "needRequest.listTitleAll": "Tất Cả Yêu Cầu Hiến Máu",
      "needRequest.listTitleMy": "Yêu Cầu Hiến Máu Của Tôi",
      "needRequest.filterByStatus": "Lọc theo Trạng Thái",
      "needRequest.allStatuses": "Tất Cả Trạng Thái",
      "needRequest.status.open": "Đang Mở",
      "needRequest.status.fulfilled": "Đã Hoàn Thành",
      "needRequest.status.expired": "Đã Hết Hạn",
      "needRequest.noRequests": "Không tìm thấy yêu cầu hiến máu nào",
      "needRequest.bloodRequestType": "Thành phần",
      "needRequest.unit": "Đơn Vị",
      "needRequest.units": "Đơn Vị",
      "needRequest.markFulfilled": "Đánh Dấu Hoàn Thành",
      "needRequest.markExpired": "Đánh Dấu Hết Hạn",
      "needRequest.confirmDelete":
        "Bạn có chắc chắn muốn xóa yêu cầu này không?",
      "needRequest.deleteError": "Lỗi khi xóa yêu cầu",
      "needRequest.updateError": "Lỗi khi cập nhật trạng thái yêu cầu",
      "needRequest.fetchError": "Lỗi khi lấy danh sách yêu cầu hiến máu",

      "needRequest.component.wholeblood": "Máu Toàn Phần",
      "needRequest.component.plasma": "Huyết Tương",
      "needRequest.component.platelets": "Tiểu Cầu",
      "needRequest.component.redcells": "Hồng Cầu",
      "needRequest.nav.createRequest": "Tạo Yêu Cầu",
      "needRequest.nav.viewRequests": "Xem Yêu Cầu",
      "needRequest.nav.viewAllRequests": "Xem Tất Cả Yêu Cầu",
      "needRequest.nav.viewMyRequests": "Xem Yêu Cầu Của Tôi",
      "needRequest.memberNotice":
        "Là thành viên, bạn chỉ có thể xem các yêu cầu hiến máu của riêng mình.",

      //common stuff
      "common.delete": "Xóa",
      "common.submitting": "Đang gửi...",
      "common.notAuthenticated": "Chưa xác thực",
      "common.refresh": "Làm mới",
      "common.loading": "Đang tải...",

      // Donate Request
      "donateRequest.title": "Đăng Ký Hiến Máu",
      "donateRequest.description":
        "Đăng ký hiến máu và giúp cứu sống những người cần máu. Sự hiến tặng của bạn có thể tạo ra sự khác biệt.",
      "donateRequest.bloodGroup": "Nhóm Máu",
      "donateRequest.selectBloodGroup": "Chọn nhóm máu",
      "donateRequest.component": "Thành Phần Máu",
      "donateRequest.selectComponent": "Chọn thành phần",
      "donateRequest.donationDate": "Ngày Hiến Máu Mong Muốn",
      "donateRequest.submit": "Gửi Đăng Ký",
      "donateRequest.submitting": "Đang gửi...",
      "donateRequest.successMessage":
        "Đăng ký hiến máu của bạn đã được gửi thành công. Đội ngũ của chúng tôi sẽ liên hệ với bạn sớm.",
      "donateRequest.submitError": "Lỗi khi gửi đăng ký. Vui lòng thử lại.",

      "donateRequest.listTitleAll": "Tất Cả Đăng Ký Hiến Máu",
      "donateRequest.listTitleMy": "Đăng Ký Hiến Máu Của Tôi",
      "donateRequest.filterByStatus": "Lọc theo Trạng Thái",
      "donateRequest.allStatuses": "Tất Cả Trạng Thái",
      "donateRequest.status.open": "Đang Mở",
      "donateRequest.status.approved": "Đã Duyệt",
      "donateRequest.status.completed": "Đã Hoàn Thành",
      "donateRequest.status.cancelled": "Đã Hủy",
      "donateRequest.status.pending": "Đang Chờ",
      "donateRequest.status.rejected": "Đã Từ Chối",
      "donateRequest.markRejected": "Đánh Dấu Từ Chối",
      "donateRequest.noRequests": "Không tìm thấy đăng ký hiến máu nào",
      "donateRequest.donationType": "Thể loại hiến máu",
      "donateRequest.markApproved": "Đánh Dấu Đã Duyệt",
      "donateRequest.markCompleted": "Đánh Dấu Hoàn Thành",
      "donateRequest.markCancelled": "Đánh Dấu Đã Hủy",
      "donateRequest.confirmDelete":
        "Bạn có chắc chắn muốn xóa đăng ký này không?",
      "donateRequest.deleteError": "Lỗi khi xóa đăng ký",
      "donateRequest.updateError": "Lỗi khi cập nhật trạng thái đăng ký",
      "donateRequest.fetchError": "Lỗi khi lấy danh sách đăng ký hiến máu",

      "donateRequest.component.wholeblood": "Máu Toàn Phần",
      "donateRequest.component.plasma": "Huyết Tương",
      "donateRequest.component.platelets": "Tiểu Cầu",
      "donateRequest.component.redcells": "Hồng Cầu",
      "donateRequest.nav.createRequest": "Đăng Ký Hiến Máu",
      "donateRequest.nav.viewRequests": "Xem Đăng Ký",
      "donateRequest.nav.viewAllRequests": "Xem Tất Cả Đăng Ký",
      "donateRequest.nav.viewMyRequests": "Xem Đăng Ký Của Tôi",
      "donateRequest.memberNotice":
        "Là thành viên, bạn chỉ có thể xem các đăng ký hiến máu của riêng mình.",
      
      "donateRequest.historyTitleAll": "Tất Cả Lịch Sử Hiến Máu",
      "donateRequest.historyTitleMy": "Lịch Sử Hiến Máu Của Tôi",
      "donateRequest.createdAt": "Tạo Lúc",
      "donateRequest.completedAt": "Hoàn Thành Lúc",
      "donateRequest.rejectionReason": "Lý Do Từ Chối",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
