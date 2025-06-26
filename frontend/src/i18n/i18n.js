import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  en: {
    translation: {
      // Blood Group Validation
      "donateRequest.bloodGroupError": "Wrong blood group",
      "donateRequest.bloodGroupMismatch":
        "The selected blood group does not match your profile",

      // Header Navigation
      nav: {
        home: "Home",
        about: "About Us",
        donationProcess: "Donation Process",
        upcomingDrives: "Upcoming Drives",
        contact: "Contact",
        login: "LOGIN",
        logout: "LOGOUT",
        welcome: "Welcome, {{name}}!",
        loading: "Loading...",
        adminPanel: "Admin Panel",
        bloodStorage: "Blood Storage",
        profile: "Profile",
        bloodRequests: "Blood Requests",
        donateBlood: "Donate Blood",
        donationHistory: "Donation History",
      },

      // Medical Health
      "donateRequest.nav.medicalHealth": "Medical Health",
      medicalHealth: {
        title: "Medical Health Screening Questions",
        description: "Manage medical screening questions for blood donation",
        currentQuestions: "Current Questions",
        noQuestions: "No questions available. Add your first question below.",
        questionContent: "Question Content",
        questionOrder: "Question Order",
        questionPlaceholder: "Enter the question",
        orderPlaceholder: "Enter question order (optional)",
        add: "Add Question",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        cancel: "Cancel",
        addNewQuestion: "Add New Question",
        loading: "Loading questions...",
        authError: "Authentication error. Please login again.",
        fetchError: "Failed to fetch questions",
        createError: "Failed to create question",
        updateError: "Failed to update question",
        deleteError: "Failed to delete question",
        createSuccess: "Question created successfully",
        updateSuccess: "Question updated successfully",
        deleteSuccess: "Question deleted successfully",
        confirmDelete: "Are you sure you want to delete this question?",
        contentRequired: "Question content is required"
      },

      // Profile Page
      profile: {
        title: "Profile Settings",
        name: "Name",
        email: "Email",
        bloodGroup: "Blood Group",
        location: "Location",
        locationPlaceholder: "Enter your city",
        selectBloodGroup: "Select blood group",
        identityCard: "Identity Card",
        identityCardHint: "Enter your identity card number",
        phoneNumber: "Phone Number",
        phoneNumberHint: "Enter your phone number",
        dateOfBirth: "Date of Birth",
        dateOfBirthHint: "Enter your date of birth",
        gender: "Gender",
        genderHint: "Select your gender",
        selectGender: "Select gender",
        genderMale: "Male",
        genderFemale: "Female",
        genderOther: "Other",
        addressDetails: "Address Details",
        street: "Street",
        streetPlaceholder: "Enter your street address",
        district: "District",
        districtPlaceholder: "Enter your district",
        city: "City",
        cityPlaceholder: "Enter your city",
        updateButton: "Update Profile",
        updating: "Updating...",
        loading: "Loading profile...",
        updateSuccess: "Profile updated successfully!",
        bloodHint:
          "Choose your blood type. This information is important for matching with donation needs.",
        cityHint:
          "Enter a city name. The location will be automatically geocoded.",
        update: "Update profile",
      },

      // Address Form
      addressForm: {
        title: "Address Information",
        submit: "Submit Address",
        submitted: "Address submitted successfully!",
        submittedAddress: "Submitted Address",
      },

      // Admin Panel
      admin: {
        authError: "auth Error",
        fetchError: "fetch Error",
        updateError: "update Error",
        confirmDelete: "Do you want to delete this user",
        deleteError: "Error deleting user. Please try again.",
        loading: "Loading admin panel...",
        title: "Admin Panel",
        description: "Manage users and donations",
        users: {
          title: "Management Board",
          name: "Name",
          email: "Email",
          role: "Role",
          actions: "Actions",
          search: "Search",
          sortBy: "Sort",
          noUsers: "No users found",
          delete: "Delete",
          roleAdmin: "Admin",
          roleStaff: "Staff",
          roleMember: "Member",
          allRoles: "All roles",
          totalUsers: "Total Users"
        },
        confirmRoleChange:
          "Are you sure you want to change this user's role to {{role}}?",
      },

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
      "home.hero.learnMore": "Learn More", 
      
      // Benefits Section
      benefits: {
        title: "Benefits of Donating Blood",
        subtitle: "Discover how your donation can make a difference",
        health: {
          title: "Save Up to 3 Lives",
          description: "A single blood donation can help save up to three lives. Your donation is separated into red blood cells, plasma, and platelets, each helping different patients."
        },
        screening: {
          title: "Free Health Screening",
          description: "Every donation includes a mini-physical with blood pressure, temperature, pulse, and hemoglobin level checks - completely free of charge."
        },
        community: {
          title: "Reduce Health Risks",
          description: "Regular blood donation may help maintain healthy iron levels and reduce oxidative stress in your body, promoting better overall health."
        },
        emergency: {
          title: "Boost Cardiovascular Health",
          description: "Donating blood can help improve blood flow and reduce the risk of heart disease by maintaining healthy iron levels."
        },
        renewal: {
          title: "Regular Blood Renewal",
          description: "Donating blood promotes the production of new blood cells, helping your body maintain healthy blood cell levels."
        },
        hemochromatosis: {
          title: "Reduces Risk of Hemochromatosis",
          description: "Regular blood donation can help reduce iron overload and decrease the risk of hemochromatosis, especially in men."
        }
      },

        // Blood Types Section
      bloodTypes: {
        title: "Blood Types & Compatibility",
        description: "Understanding blood types is crucial for successful transfusions. Here's a quick guide to blood type compatibility.",
        canDonateTo: "Can donate to:",
        canReceiveFrom: "Can receive from:",
        universalDonor: "Universal Donor",
        allTypes: "All Blood Types",
        aPlus: {
          donateTo: "A+, AB+",
          receiveFrom: "A+, A-, O+, O-"
        },
        aMinus: {
          donateTo: "A+, A-, AB+, AB-",
          receiveFrom: "A-, O-"
        },
        bPlus: {
          donateTo: "B+, AB+",
          receiveFrom: "B+, B-, O+, O-"
        },
        bMinus: {
          donateTo: "B+, B-, AB+, AB-",
          receiveFrom: "B-, O-"
        },
        abPlus: {
          donateTo: "AB+ only",
          receiveFrom: "All Blood Types"
        },
        abMinus: {
          donateTo: "AB+, AB-",
          receiveFrom: "A-, B-, AB-, O-"
        },
        oPlus: {
          donateTo: "A+, B+, AB+, O+",
          receiveFrom: "O+, O-"
        },
        oMinus: {
          donateTo: "All Blood Types",
          receiveFrom: "O- only"
        }
      },

      // Donation Process Section
      donationProcess: {
        title: "The Donation Process",
        description: "Donating blood is a simple and straightforward process that takes about an hour from start to finish.",
        step1: {
          title: "Registration",
          description: "Present ID and answer basic health questions",
        },
        step2: {
          title: "Health Screening",
          description: "Quick physical (temperature, blood pressure, pulse, hemoglobin)",
        },
        step3: {
          title: "Blood Donation",
          description: "The actual donation takes only 8-10 minutes",
        },
        step4: {
          title: "Refreshments",
          description: "Rest and enjoy snacks to replenish fluids and energy",
        },
      },

      // Testimonials Section
      testimonials: {
        title: "Donor Testimonials",
        quote1: "I've been donating blood for over 10 years now. It's just an hour of my time, but it means the world to someone in need.",
        author1: "- Sarah Johnson",
        quote2: "After my son's accident, he needed multiple transfusions. Now I donate regularly to give back and help others like him.",
        author2: "- Michael Rodriguez",
        quote3: "It's such a simple way to make a big difference. I feel great knowing my donation directly helps save lives!",
        author3: "- Priya Patel",
      },

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
      "needRequest.status.open": "Pending",
      "needRequest.status.fulfilled": "Fulfilled",
      "needRequest.status.expired": "Expired",
      "needRequest.noRequests": "No blood requests found",
      "needRequest.bloodRequestType": "Request type",
      "needRequest.unit": "Unit",
      
      // Units key was duplicated - removed here
      "needRequest.markFulfilled": "Mark as Fulfilled",
      "needRequest.markExpired": "Mark as Expired",
      "needRequest.confirmDelete":
        "Are you sure you want to delete this request?",
      "needRequest.deleteError": "Error deleting request",
      "needRequest.updateError": "Error updating request status",
      "needRequest.fetchError": "Error fetching blood requests",
      "needRequest.nav.createRequest": "Create Request",
      "needRequest.nav.viewRequests": "View Requests",
      "needRequest.nav.viewAllRequests": "View All Requests",
      "needRequest.nav.viewMyRequests": "View My Requests",
      "needRequest.memberNotice":
        "As a member, you can only see your own blood donation requests.",

      //common stuff
      common: {
        delete: "Delete",
        submitting: "Submitting...",
        notAuthenticated: "Not authenticated",
        refresh: "Refresh",
        loading: "Loading...",
        actions: "Actions",
        yes: "Yes",
        no: "No",
        close: "Close",
        cancel: "Cancel",
        role: {
          guest: "Guest",
          member: "Member",
          staff: "Staff",
          admin: "Admin",
        },
        component: {
          wholeblood: "Whole Blood",
          plasma: "Plasma",
          platelets: "Platelets",
          redcells: "Red Cells",
          unknown: "Unknown",
        },
      },

      // Blood Storage Management
      "bloodStorage.title": "Blood Storage Management",
      "bloodStorage.staffOnly":
        "This page is restricted to staff and admin users only.",
      "bloodStorage.summary": "Blood Inventory Summary",
      "bloodStorage.detailedInventory": "Detailed Inventory",
      "bloodStorage.addUnit": "Add Blood Unit",
      "bloodStorage.cancelAdd": "Cancel",
      "bloodStorage.refresh": "Refresh Data",
      "bloodStorage.addNewUnit": "Add New Blood Unit",
      "bloodStorage.bloodType": "Blood Type",
      "bloodStorage.component": "Component",
      "bloodStorage.volume": "Volume",
      "bloodStorage.dateAdded": "Date Added",
      "bloodStorage.expirationDate": "Expiration Date",
      "bloodStorage.daysUntilExpired": "Days Until Expired",
      "bloodStorage.expired": "Expired",
      "bloodStorage.units": "Units",
      "bloodStorage.blood": "Blood",
      "bloodStorage.status": "Status",
      "bloodStorage.sufficient": "Sufficient",
      "bloodStorage.low": "Low",
      "bloodStorage.critical": "Critical",
      "bloodStorage.fetchError": "Error fetching blood inventory",
      "bloodStorage.addError": "Error adding blood unit",
      "bloodStorage.deleteError": "Error deleting blood unit",
      "bloodStorage.confirmDelete":
        "Are you sure you want to delete this blood unit?",
      "bloodStorage.noUnits": "No blood units available",

      // Donate Request
      donateRequest: {
        title: "Blood Donation Registration",
        description: "Register to donate blood and help save lives. Your donation can make a difference.",
        bloodGroup: "Blood Group",
        selectBloodGroup: "Select blood group",
        component: "Blood Component",
        selectComponent: "Select component",
        donationDate: "Preferred Donation Date",
        submit: "Submit Registration",
        submitting: "Submitting...",
        successMessage: "Your donation registration has been submitted successfully. Our team will contact you soon.",
        submitError: "Error submitting your registration. Please try again.",
        listTitleAll: "All Donation Registrations",
        listTitleMy: "My Donation Registrations",
        filterByStatus: "Filter by Status",
        allStatuses: "All Statuses",
        status: {
          open: "Open",
          approved: "Approved",
          completed: "Completed",
          cancelled: "Cancelled",
          pending: "Pending",
          rejected: "Rejected"
        },
        viewMedicalQuestions: "Medical Questions",
        medicalQuestionsTitle: "Medical Screening Questions",
        noMedicalData: "No medical screening data available",
        markRejected: "Mark as Rejected",
        noRequests: "No donation registrations found",
        donationType: "Donation type",
        markApproved: "Mark as Approved",
        markCompleted: "Mark as Completed",
        markCancelled: "Mark as Cancelled",
        confirmDelete: "Are you sure you want to delete this registration?",
        deleteError: "Error deleting registration",
        updateError: "Error updating registration status",
        fetchError: "Error fetching donation registrations",
        nav: {
          createRequest: "Register Donation",
          viewRequests: "View Registrations",
          viewAllRequests: "View All Registrations",
          viewMyRequests: "View My Registrations",
          medicalHealth: "Medical Health"
        },
        memberNotice: "As a member, you can only see your own donation registrations.",
        historyTitleAll: "Blood donation history",
        historyTitleMy: "My blood donation history",
        createdAt: "Created at",
        completedAt: "Completed at",
        rejectionReason: "Reason for rejection",
        medicalHistory: "Medical History",
        noMedicalHistory: "No medical history",
        medicalHistoryTitle: "Donation history",
        quantity: "Quantity",
        fetchHistoryError: "Failed to fetch donation registration data",
        healthCheck: "Health Check",
        healthCheckTitle: "Health Check Form",
        completeTab: "Complete Donation",
        cancelTab: "Cancel Donation",
        weight: "Weight",
        height: "Height",
        bloodPressure: "Blood Pressure",
        heartRate: "Heart Rate",
        alcoholLevel: "Alcohol Level",
        temperature: "Temperature",
        hemoglobin: "Hemoglobin",
        invalidQuantity: "Please enter a valid quantity (minimum 1)",
        cancellationReason: "Cancellation Reason",
        cancellationReasonPlaceholder: "Please explain the reason for cancelling this donation",
        followUpDate: "Follow-up Date",
        confirmComplete: "Complete Donation",
        confirmCancel: "Cancel Donation",
        reasonRequired: "Please provide a reason for cancellation",
        followUpDateRequired: "Please select a follow-up date",
        completedSuccessfully: "Donation completed successfully!",
        canceledSuccessfully: "Donation canceled successfully!",
        bloodGroupError: "Wrong blood group",
        bloodGroupMismatch: "The selected blood group does not match your profile"
      },

      // Health check translations
      "donateRequest.healthCheck": "Kiểm Tra Sức Khỏe",
      "donateRequest.healthCheckTitle": "Biểu Mẫu Kiểm Tra Sức Khỏe",
      "donateRequest.completeTab": "Hoàn Thành Hiến Máu",
      "donateRequest.cancelTab": "Hủy Hiến Máu",
      "donateRequest.weight": "Cân Nặng",
      "donateRequest.height": "Chiều Cao",
      "donateRequest.bloodPressure": "Huyết Áp",
      "donateRequest.heartRate": "Nhịp Tim",
      "donateRequest.alcoholLevel": "Nồng Độ Cồn",
      "donateRequest.temperature": "Nhiệt Độ",
      "donateRequest.hemoglobin": "Hemoglobin",
      "donateRequest.quantity": "Số Lượng",
      "donateRequest.invalidQuantity":
        "Vui lòng nhập số lượng hợp lệ (tối thiểu 1)",
      "donateRequest.cancellationReason": "Lý Do Hủy",
      "donateRequest.cancellationReasonPlaceholder":
        "Vui lòng giải thích lý do hủy hiến máu này",
      "donateRequest.followUpDate": "Ngày Hẹn Tái Khám",
      "donateRequest.confirmComplete": "Hoàn Thành Hiến Máu",
      "donateRequest.confirmCancel": "Hủy Hiến Máu",
      "donateRequest.reasonRequired": "Vui lòng cung cấp lý do hủy",
      "donateRequest.followUpDateRequired": "Vui lòng chọn ngày hẹn tái khám",
    },
  },
  vi: {
    translation: {
      // Blood Group Validation
      "donateRequest.bloodGroupError": "Sai nhóm máu",
      "donateRequest.bloodGroupMismatch":
        "Nhóm máu đã chọn không khớp với hồ sơ của bạn",

      // Header Navigation
      nav: {
        home: "Trang Chủ",
        about: "Về Chúng Tôi",
        donationProcess: "Quy Trình Hiến Máu",
        upcomingDrives: "Chương Trình Sắp Tới",
        contact: "Liên Hệ",
        login: "ĐĂNG NHẬP",
        logout: "ĐĂNG XUẤT",
        welcome: "Chào mừng, {{name}}!",
        loading: "Đang tải...",
        adminPanel: "Quản Trị",
        bloodStorage: "Kho Máu",
        profile: "Hồ Sơ",
        bloodRequests: "Yêu Cầu Máu",
        donateBlood: "Hiến Máu",
        donationHistory: "Lịch Sử Hiến Máu",
      },

      // Medical Health
      "donateRequest.nav.medicalHealth": "Medical Health",
      medicalHealth: {
        title: "Câu hỏi sàng lọc sức khỏe",
        description: "Quản lý câu hỏi sàng lọc sức khỏe cho hiến máu",
        currentQuestions: "Các câu hỏi hiện tại",
        noQuestions: "Chưa có câu hỏi nào. Thêm câu hỏi đầu tiên bên dưới.",
        questionContent: "Nội dung câu hỏi",
        questionOrder: "Thứ tự câu hỏi",
        questionPlaceholder: "Nhập câu hỏi",
        orderPlaceholder: "Nhập thứ tự câu hỏi (không bắt buộc)",
        add: "Thêm câu hỏi",
        edit: "Chỉnh sửa",
        delete: "Xóa",
        save: "Lưu",
        cancel: "Hủy",
        addNewQuestion: "Thêm câu hỏi mới",
        loading: "Đang tải câu hỏi...",
        authError: "Lỗi xác thực. Vui lòng đăng nhập lại.",
        fetchError: "Không thể tải câu hỏi",
        createError: "Không thể tạo câu hỏi",
        updateError: "Không thể cập nhật câu hỏi",
        deleteError: "Không thể xóa câu hỏi",
        createSuccess: "Tạo câu hỏi thành công",
        updateSuccess: "Cập nhật câu hỏi thành công",
        deleteSuccess: "Xóa câu hỏi thành công",
        confirmDelete: "Bạn có chắc muốn xóa câu hỏi này?",
        contentRequired: "Nội dung câu hỏi là bắt buộc"
      },

      // Profile Page
      profile: {
        title: "Cài Đặt Hồ Sơ",
        name: "Tên",
        email: "Email",
        bloodGroup: "Nhóm Máu",
        location: "Địa Điểm",
        locationPlaceholder: "Nhập tên thành phố của bạn",
        selectBloodGroup: "Chọn nhóm máu",
        identityCard: "Số CMND",
        identityCardHint: "Nhập số CMND của bạn",
        phoneNumber: "Số Điện Thoại",
        phoneNumberHint: "Nhập số điện thoại của bạn",
        dateOfBirth: "Ngày Sinh",
        dateOfBirthHint: "Nhập ngày sinh của bạn",
        gender: "Giới Tính",
        genderHint: "Chọn giới tính của bạn",
        selectGender: "Chọn giới tính",
        genderMale: "Nam",
        genderFemale: "Nữ",
        genderOther: "Khác",
        addressDetails: "Chi Tiết Địa Chỉ",
        street: "Đường",
        streetPlaceholder: "Nhập tên đường của bạn",
        district: "Quận",
        districtPlaceholder: "Nhập tên quận của bạn",
        city: "Thành Phố",
        cityPlaceholder: "Nhập tên thành phố của bạn",
        updateButton: "Cập Nhật Hồ Sơ",
        updating: "Đang cập nhật...",
        loading: "Đang tải hồ sơ...",
        updateSuccess: "Cập nhật hồ sơ thành công!",
        bloodHint:
          "Chọn nhóm máu của bạn. Thông tin này rất quan trọng để phù hợp với nhu cầu hiến tặng.",
        cityHint:
          "Nhập tên thành phố. Vị trí sẽ được tự động mã hóa địa lý.",
        update: "Cập nhật thông tin",
      },

      // Address Form
      addressForm: {
        title: "Thông Tin Địa Chỉ",
        submit: "Gửi Địa Chỉ",
        submitted: "Gửi địa chỉ thành công!",
        submittedAddress: "Địa Chỉ Đã Gửi",
      },

      // Admin Panel
      admin: {
        authError: "Lỗi xác thực",
        fetchError: "Lỗi khi lấy dữ liệu",
        updateError: "Lỗi khi cập nhật vai trò",
        confirmDelete: "Bạn có chắc chắn muốn xóa người dùng này không?",
        deleteError: "Lỗi khi xóa người dùng. Vui lòng thử lại.",
        loading: "Đang tải bảng quản trị...",
        title: "Bảng Quản Trị",
        description: "Quản lý người dùng và các khoản hiến máu",
        users: {
          title: "Bảng Quản Lý",
          name: "Họ tên",
          email: "Email",
          role: "Vai trò",
          actions: "Hành động",
          search: "Tìm kiếm",
          sortBy: "Sắp xếp",
          noUsers: "Không tìm thấy người dùng nào",
          delete: "Xóa",
          roleAdmin: "Quản trị viên",
          roleStaff: "Nhân viên",
          roleMember: "Thành viên",
          allRoles: "Tất cả",
          totalUsers: "Tổng số người dùng"
        },
        confirmRoleChange:
          "Bạn có chắc muốn thay đổi vai trò của người dùng này thành {{role}} không?",
      },

      // Home Page
      "home.hero.title": "Tặng Món Quà Của Sự Sống",
      "home.hero.subtitle2": "Máu Của Bạn Có Thể Cứu Sống",
      "home.hero.subtitle":
        "Mỗi ngày, hàng ngàn người cần truyền máu để sống sót. Việc hiến máu của bạn có thể tạo ra sự khác biệt đáng kể trong cuộc sống của ai đó.",
      "home.hero.donateButton": "Hiến Máu Ngay",
      "home.hero.learnMore": "Tìm Hiểu Thêm",
      
      // Benefits Section
      benefits: {
        title: "Lợi Ích Của Việc Hiến Máu",
        subtitle: "Khám phá cách hiến máu của bạn có thể tạo ra sự khác biệt",
        health: {
          title: "Cứu Tới 3 Mạng Sống",
          description: "Một lần hiến máu có thể giúp cứu tới ba mạng sống. Máu hiến của bạn được tách thành hồng cầu, huyết tương và tiểu cầu, mỗi thành phần giúp đỡ các bệnh nhân khác nhau."
        },
        screening: {
          title: "Khám Sức Khỏe Miễn Phí",
          description: "Mỗi lần hiến máu bao gồm kiểm tra sức khỏe cơ bản với huyết áp, nhiệt độ, mạch và mức hemoglobin - hoàn toàn miễn phí."
        },
        community: {
          title: "Giảm Rủi Ro Sức Khỏe",
          description: "Hiến máu thường xuyên có thể giúp duy trì mức sắt khỏe mạnh và giảm stress oxy hóa trong cơ thể, thúc đẩy sức khỏe tổng thể tốt hơn."
        },
        emergency: {
          title: "Tăng Cường Sức Khỏe Tim Mạch",
          description: "Hiến máu có thể giúp cải thiện lưu lượng máu và giảm nguy cơ bệnh tim bằng cách duy trì mức sắt khỏe mạnh."
        },
        renewal: {
          title: "Tái Tạo Máu Đều Đặn",
          description: "Hiến máu thúc đẩy sản xuất các tế bào máu mới, giúp cơ thể bạn duy trì mức tế bào máu khỏe mạnh."
        },
        hemochromatosis: {
          title: "Giảm Nguy Cơ Thừa Sắt",
          description: "Hiến máu thường xuyên có thể giúp giảm tình trạng thừa sắt và nguy cơ mắc bệnh hemochromatosis, đặc biệt ở nam giới."
        }
      },

        // Blood Types Section
      bloodTypes: {
        title: "Nhóm Máu & Tương Thích",
        description: "Hiểu về nhóm máu là rất quan trọng cho việc truyền máu thành công. Đây là hướng dẫn nhanh về tính tương thích của nhóm máu.",
        canDonateTo: "Có thể hiến cho:",
        canReceiveFrom: "Có thể nhận từ:",
        universalDonor: "Người Cho Máu Toàn Cầu",
        allTypes: "Tất Cả Nhóm Máu",
        aPlus: {
          donateTo: "A+, AB+",
          receiveFrom: "A+, A-, O+, O-"
        },
        aMinus: {
          donateTo: "A+, A-, AB+, AB-",
          receiveFrom: "A-, O-"
        },
        bPlus: {
          donateTo: "B+, AB+",
          receiveFrom: "B+, B-, O+, O-"
        },
        bMinus: {
          donateTo: "B+, B-, AB+, AB-",
          receiveFrom: "B-, O-"
        },
        abPlus: {
          donateTo: "Chỉ AB+",
          receiveFrom: "Tất Cả Nhóm Máu"
        },
        abMinus: {
          donateTo: "AB+, AB-",
          receiveFrom: "A-, B-, AB-, O-"
        },
        oPlus: {
          donateTo: "A+, B+, AB+, O+",
          receiveFrom: "O+, O-"
        },
        oMinus: {
          donateTo: "Tất Cả Nhóm Máu",
          receiveFrom: "Chỉ O-"
        }
      },

      // Donation Process Section
      donationProcess: {
        title: "Quy Trình Hiến Máu",
        description: "Hiến máu là một quy trình đơn giản và dễ hiểu, mất khoảng một giờ từ đầu đến cuối.",
        step1: {
          title: "Đăng Ký",
          description: "Xuất trình CMND và trả lời các câu hỏi sức khỏe cơ bản",
        },
        step2: {
          title: "Kiểm Tra Sức Khỏe",
          description: "Khám nhanh (nhiệt độ, huyết áp, mạch, hemoglobin)",
        },
        step3: {
          title: "Hiến Máu",
          description: "Việc hiến máu thực tế chỉ mất 8-10 phút",
        },
        step4: {
          title: "Nghỉ Ngơi",
          description: "Nghỉ ngơi và thưởng thức đồ ăn nhẹ để bổ sung chất lỏng và năng lượng",
        },
      },

      // Testimonials Section
      testimonials: {
        title: "Lời Chứng Thực Từ Người Hiến Máu",
        quote1: "Tôi đã hiến máu hơn 10 năm nay. Chỉ mất một giờ của tôi, nhưng có ý nghĩa rất lớn đối với ai đó đang cần.",
        author1: "- Sarah Johnson",
        quote2: "Sau tai nạn của con trai tôi, cậu ấy cần nhiều lần truyền máu. Giờ tôi hiến máu thường xuyên để đền đáp và giúp đỡ những người khác như cậu ấy.",
        author2: "- Michael Rodriguez",
        quote3: "Đây là cách đơn giản để tạo ra sự khác biệt lớn. Tôi cảm thấy tuyệt vời khi biết việc hiến máu của mình trực tiếp giúp cứu sống!",
        author3: "- Priya Patel",
      },

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
      "needRequest.title": "Yêu Cầu Máu",
      "needRequest.description":
        "Yêu cầu máu cho bệnh nhân cần giúp đỡ. Cộng đồng người hiến máu của chúng tôi sẵn sàng hỗ trợ.",
      "needRequest.bloodGroup": "Nhóm Máu",
      "needRequest.selectBloodGroup": "Chọn nhóm máu",
      "needRequest.component": "Thành Phần Máu",
      "needRequest.selectComponent": "Chọn thành phần máu",
      "needRequest.units": "Đơn Vị",
      "needRequest.reason": "Lý Do Yêu Cầu",
      "needRequest.reasonPlaceholder":
        "Vui lòng giải thích lý do cần máu (ví dụ: phẫu thuật, tai nạn, điều trị liên tục)",
      "needRequest.submit": "Gửi Yêu Cầu",
      "needRequest.submitting": "Đang gửi...",
      "needRequest.successMessage":
        "Yêu cầu máu của bạn đã được gửi thành công. Đội ngũ của chúng tôi sẽ xử lý nhanh nhất có thể.",
      "needRequest.submitError": "Lỗi khi gửi yêu cầu. Vui lòng thử lại.",

      "needRequest.listTitleAll": "Tất Cả Yêu Cầu Máu",
      "needRequest.listTitleMy": "Yêu Cầu Máu Của Tôi",
      "needRequest.filterByStatus": "Lọc theo Trạng Thái",
      "needRequest.allStatuses": "Tất Cả Trạng Thái",
      "needRequest.status.open": "Chưa giải quyết",
      "needRequest.status.fulfilled": "Đã Hoàn Thành",
      "needRequest.status.expired": "Đã Hết Hạn",
      "needRequest.noRequests": "Không tìm thấy yêu cầu máu nào",
      "needRequest.bloodRequestType": "Thành phần",
      "needRequest.unit": "Đơn Vị",
      "needRequest.markFulfilled": "Đánh Dấu Hoàn Thành",
      "needRequest.markExpired": "Đánh Dấu Hết Hạn",
      "needRequest.confirmDelete":
        "Bạn có chắc chắn muốn xóa yêu cầu này không?",
      "needRequest.deleteError": "Lỗi khi xóa yêu cầu",
      "needRequest.updateError": "Lỗi khi cập nhật trạng thái yêu cầu",
      "needRequest.fetchError": "Lỗi khi lấy danh sách yêu cầu máu",
      "needRequest.nav.createRequest": "Tạo Yêu Cầu",
      "needRequest.nav.viewRequests": "Xem Yêu Cầu",
      "needRequest.nav.viewAllRequests": "Xem Tất Cả Yêu Cầu",
      "needRequest.nav.viewMyRequests": "Xem Yêu Cầu Của Tôi",
      "needRequest.memberNotice":
        "Là thành viên, bạn chỉ có thể xem các yêu cầu máu của riêng mình.", 
        
      //common stuff
      common: {
        delete: "Xóa",
        submitting: "Đang gửi...",
        notAuthenticated: "Chưa xác thực",
        refresh: "Làm mới",
        loading: "Đang tải...",
        actions: "Thao tác",
        yes: "Có",
        no: "Không",
        close: "Đóng",
        cancel: "Hủy",
        role: {
          member: "Thành viên",
          staff: "Nhân viên",
          admin: "Quản trị viên",
        },
        component: {
          wholeblood: "Máu Toàn Phần",
          plasma: "Huyết Tương",
          platelets: "Tiểu Cầu",
          redcells: "Hồng Cầu",
          unknown: "Chưa biết",
        },
      },

      // Blood Storage Management
      "bloodStorage.title": "Quản Lý Kho Máu",
      "bloodStorage.staffOnly":
        "Trang này chỉ dành cho nhân viên và quản trị viên.",
      "bloodStorage.summary": "Tổng Quan Kho Máu",
      "bloodStorage.detailedInventory": "Kho Máu Chi Tiết",
      "bloodStorage.addUnit": "Thêm Đơn Vị Máu",
      "bloodStorage.cancelAdd": "Hủy",
      "bloodStorage.refresh": "Làm Mới Dữ Liệu",
      "bloodStorage.addNewUnit": "Thêm Đơn Vị Máu Mới",
      "bloodStorage.bloodType": "Nhóm Máu",
      "bloodStorage.component": "Thành Phần",
      "bloodStorage.volume": "Thể Tích",
      "bloodStorage.dateAdded": "Ngày Thêm",
      "bloodStorage.expirationDate": "Ngày Hết Hạn",
      "bloodStorage.daysUntilExpired": "Số Ngày Còn Lại",
      "bloodStorage.expired": "Đã Hết Hạn",
      "bloodStorage.units": "Đơn Vị",
      "bloodStorage.blood": "Máu",
      "bloodStorage.status": "Trạng Thái",
      "bloodStorage.sufficient": "Đầy Đủ",
      "bloodStorage.low": "Thấp",
      "bloodStorage.critical": "Thiếu",
      "bloodStorage.fetchError": "Lỗi khi lấy dữ liệu kho máu",
      "bloodStorage.addError": "Lỗi khi thêm đơn vị máu",
      "bloodStorage.deleteError": "Lỗi khi xóa đơn vị máu",
      "bloodStorage.confirmDelete": "Bạn có chắc chắn muốn xóa đơn vị máu này?",
      "bloodStorage.noUnits": "Không có đơn vị máu nào",

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
      "donateRequest.viewMedicalQuestions": "Câu Hỏi Y Tế",
      "donateRequest.medicalQuestionsTitle": "Câu Hỏi Sàng Lọc Y Tế",
      "donateRequest.noMedicalData":
        "Đơn đăng ký này không có dữ liệu câu hỏi y tế. Có thể đơn đăng ký được tạo trước khi tính năng sàng lọc y tế được triển khai.",
      "donateRequest.medicalStep": "Sàng Lọc Y Tế",
      "donateRequest.basicInfoStep": "Thông Tin Cơ Bản",
      "donateRequest.nextStep": "Tiếp Theo",
      "donateRequest.prevStep": "Quay Lại",

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
      "donateRequest.nav.createRequest": "Đăng Ký Hiến Máu",
      "donateRequest.nav.viewRequests": "Xem Đăng Ký",
      "donateRequest.nav.viewAllRequests": "Xem Tất Cả Đăng Ký",
      "donateRequest.nav.viewMyRequests": "Xem Đăng Ký Của Tôi",
      "donateRequest.memberNotice":
        "Là thành viên, bạn chỉ có thể xem các đăng ký hiến máu của riêng mình.",

      "donateRequest.historyTitleAll": "Lịch Sử Hiến Máu",
      "donateRequest.historyTitleMy": "Lịch Sử Hiến Máu Của Tôi",
      "donateRequest.createdAt": "Tạo Lúc",
      "donateRequest.completedAt": "Hoàn Thành Lúc",
      "donateRequest.rejectionReason": "Lý Do Từ Chối",
      "donateRequest.medicalHistory": "Lịch sử bệnh",
      "donateRequest.medicalQuestionsTitle": "Câu hỏi sàng lọc y tế",
      "donateRequest.noMedicalData": "Không có dữ liệu sàng lọc y tế",

      "donateRequest.markRejected": "Đánh Dấu Từ Chối",
      "donateRequest.noRequests": "No donation registrations found",
      "donateRequest.donationType": "Thể loại hiến máu",
      "donateRequest.markApproved": "Đánh dấu đã duyệt",
      "donateRequest.markCompleted": "Đánh dấu hoàn thành",
      "donateRequest.markCancelled": "Đánh dấu đã hủy",
      "donateRequest.confirmDelete":
        "Are you sure you want to delete this registration?",
      "donateRequest.deleteError": "Error deleting registration",
      "donateRequest.updateError": "Error updating registration status",
      "donateRequest.fetchError": "Error fetching donation registrations",
      "donateRequest.nav.createRequest": "Đăng Ký Hiến Máu",
      "donateRequest.nav.viewRequests": "Xem Đăng Ký",
      "donateRequest.nav.viewAllRequests": "Xem Tất Cả Đăng Ký",
      "donateRequest.nav.viewMyRequests": "Xem Đăng Ký Của Tôi",
      "donateRequest.memberNotice":
        "Là thành viên, bạn chỉ có thể xem các đăng ký hiến máu của riêng mình.",

      "donateRequest.historyTitleAll": "Lịch Sử Hiến Máu",
      "donateRequest.historyTitleMy": "Lịch Sử Hiến Máu Của Tôi",
      "donateRequest.createdAt": "Tạo Lúc",
      "donateRequest.completedAt": "Hoàn Thành Lúc",
      "donateRequest.rejectionReason": "Lý Do Từ Chối",
      "donateRequest.medicalHistory": "Lịch sử bệnh",
      "donateRequest.medicalHistoryTitle": "Lịch sử hiến máu",
      "donateRequest.noMedicalHistory": "Không có lịch sử bệnh nào",
      "donateRequest.donationDate": "Ngày hiến máu",
      "donateRequest.quantity": "Số lượng",
      "donateRequest.fetchHistoryError": "Không thể tải dữ liệu đăng ký hiến máu",
      "donateRequest.updateError": "Không thể cập nhật trạng thái yêu cầu",
      "donateRequest.deleteError": "Không thể xóa yêu cầu",
      "donateRequest.medicalHistory": "Lịch sử bệnh",
      "donateRequest.medicalHistoryTitle": "Lịch sử hiến máu",
      "donateRequest.noMedicalHistory": "Không có lịch sử hiến máu",
      "donateRequest.donationDate": "Ngày hiến máu",
      "donateRequest.quantity": "Số lượng",
      "donateRequest.fetchHistoryError": "Không thể tải lịch sử bệnh",

      // Health check translations
      "donateRequest.healthCheck": "Kiểm Tra Sức Khỏe",
      "donateRequest.healthCheckTitle": "Biểu Mẫu Kiểm Tra Sức Khỏe",
      "donateRequest.completeTab": "Hoàn Thành Hiến Máu",
      "donateRequest.cancelTab": "Hủy Hiến Máu",
      "donateRequest.weight": "Cân Nặng",
      "donateRequest.height": "Chiều Cao",
      "donateRequest.bloodPressure": "Huyết Áp",
      "donateRequest.heartRate": "Nhịp Tim",
      "donateRequest.alcoholLevel": "Nồng Độ Cồn",
      "donateRequest.temperature": "Nhiệt Độ",
      "donateRequest.hemoglobin": "Hemoglobin",
      "donateRequest.quantity": "Số Lượng",
      "donateRequest.invalidQuantity":
        "Vui lòng nhập số lượng hợp lệ (tối thiểu 1)",
      "donateRequest.cancellationReason": "Lý Do Hủy",
      "donateRequest.cancellationReasonPlaceholder":
        "Vui lòng giải thích lý do hủy hiến máu này",
      "donateRequest.followUpDate": "Ngày Hẹn Tái Khám",
      "donateRequest.confirmComplete": "Hoàn Thành Hiến Máu",
      "donateRequest.confirmCancel": "Hủy Hiến Máu",
      "donateRequest.reasonRequired": "Vui lòng cung cấp lý do hủy",
      "donateRequest.followUpDateRequired": "Vui lòng chọn ngày hẹn tái khám",
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

// Add new translation keys (don't worry about duplicates, i18next will handle them)
i18n.addResources("en", "translation", {
  "donateRequest.completedSuccessfully": "Donation completed successfully!",
  "donateRequest.canceledSuccessfully": "Donation canceled successfully!",
});

i18n.addResources("vi", "translation", {
  "donateRequest.completedSuccessfully": "Đã hoàn thành hiến máu thành công!",
  "donateRequest.canceledSuccessfully": "Đã hủy hiến máu thành công!",
});

export default i18n;