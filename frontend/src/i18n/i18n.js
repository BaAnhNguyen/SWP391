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
        contentRequired: "Question content is required",
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
          ban: "Ban",
          unban: "Unban",
          roleAdmin: "Admin",
          roleStaff: "Staff",
          roleMember: "Member",
          allRoles: "All roles",
          totalUsers: "Total Users",
        },
        confirmRoleChange:
          "Are you sure you want to change this user's role to {{role}}?",
      },

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
          description:
            "A single blood donation can help save up to three lives. Your donation is separated into red blood cells, plasma, and platelets, each helping different patients.",
        },
        screening: {
          title: "Free Health Screening",
          description:
            "Every donation includes a mini-physical with blood pressure, temperature, pulse, and hemoglobin level checks - completely free of charge.",
        },
        community: {
          title: "Reduce Health Risks",
          description:
            "Regular blood donation may help maintain healthy iron levels and reduce oxidative stress in your body, promoting better overall health.",
        },
        emergency: {
          title: "Boost Cardiovascular Health",
          description:
            "Donating blood can help improve blood flow and reduce the risk of heart disease by maintaining healthy iron levels.",
        },
        renewal: {
          title: "Regular Blood Renewal",
          description:
            "Donating blood promotes the production of new blood cells, helping your body maintain healthy blood cell levels.",
        },
        hemochromatosis: {
          title: "Reduces Risk of Hemochromatosis",
          description:
            "Regular blood donation can help reduce iron overload and decrease the risk of hemochromatosis, especially in men.",
        },
      },

      // Blood Types Section
      bloodTypes: {
        title: "Blood Types & Compatibility",
        description:
          "Understanding blood types is crucial for successful transfusions. Here's a quick guide to blood type compatibility.",
        canDonateTo: "Can donate to:",
        canReceiveFrom: "Can receive from:",
        universalDonor: "Universal Donor",
        allTypes: "All Blood Types",
        aPlus: {
          donateTo: "A+, AB+",
          receiveFrom: "A+, A-, O+, O-",
        },
        aMinus: {
          donateTo: "A+, A-, AB+, AB-",
          receiveFrom: "A-, O-",
        },
        bPlus: {
          donateTo: "B+, AB+",
          receiveFrom: "B+, B-, O+, O-",
        },
        bMinus: {
          donateTo: "B+, B-, AB+, AB-",
          receiveFrom: "B-, O-",
        },
        abPlus: {
          donateTo: "AB+ only",
          receiveFrom: "All Blood Types",
        },
        abMinus: {
          donateTo: "AB+, AB-",
          receiveFrom: "A-, B-, AB-, O-",
        },
        oPlus: {
          donateTo: "A+, B+, AB+, O+",
          receiveFrom: "O+, O-",
        },
        oMinus: {
          donateTo: "All Blood Types",
          receiveFrom: "O- only",
        },
      },

      // Donation Process Section
      donationProcess: {
        title: "The Donation Process",
        description:
          "Donating blood is a simple and straightforward process that takes about an hour from start to finish.",
        step1: {
          title: "Registration",
          description: "Present ID and answer basic health questions",
        },
        step2: {
          title: "Health Screening",
          description:
            "Quick physical (temperature, blood pressure, pulse, hemoglobin)",
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
        quote1:
          "I've been donating blood for over 10 years now. It's just an hour of my time, but it means the world to someone in need.",
        author1: "- Sarah Johnson",
        quote2:
          "After my son's accident, he needed multiple transfusions. Now I donate regularly to give back and help others like him.",
        author2: "- Michael Rodriguez",
        quote3:
          "It's such a simple way to make a big difference. I feel great knowing my donation directly helps save lives!",
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
      "donateRequest.nav.viewAllRequests": "View All Registration",
      "donateRequest.nav.viewMyRequests": "View Registraion",
      "donateRequest.nav.createRequest": "Register Donation",
      "donateRequest.healthCheck": "HealthCheck",

      // Language Switcher
      "language.switch": "Language",
      "language.english": "English",
      "language.vietnamese": "Tiếng Việt",

      // Legal Pages
      "legal.terms.title": "Terms of Service",
      "legal.terms.content": "Terms of Service content goes here...",
      "legal.privacy.title": "Privacy Policy",
      "legal.privacy.content": "Privacy Policy content goes here...",

      // Need Request
      "needRequest.title": "Blood Need Request",
      "needRequest.description":
        "Request blood donations for patients in need. Our community of donors is ready to help.",
      "needRequest.nav.viewAllRequests": "View all request",
      "needRequest.bloodGroup": "Blood Group",
      "needRequest.selectBloodGroup": "Select blood group",
      "needRequest.component": "Blood Component",
      "needRequest.selectComponent": "Select component",
      "needRequest.unit": "Units Required",
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
      "needRequest.status.pending": "Pending",
      "needRequest.status.fulfilled": "Fulfilled",
      "needRequest.status.completed": "Completed",
      "needRequest.status.expired": "Expired",
      "needRequest.status.matched": "Matched",
      "needRequest.noRequests": "No blood requests found",
      "needRequest.assign": "Assign",
      "needRequest.assignError": "Error assigning blood units",
      "needRequest.status.assigned": "Assigned",
      "needRequest.markCompleted": "Đánh dấu đã hoàn tất",
      "needRequest.confirmComplete":
        "Bạn có chắc chắn muốn đánh dấu yêu cầu này đã hoàn tất?",
      "needRequest.completeError": "Lỗi khi hoàn tất yêu cầu",
      "needRequest.confirmDelete":
        "Bạn có chắc chắn muốn xóa yêu cầu máu này không?",
      "needRequest.requestedBy": "Requested By",
      "needRequest.urgency": "Urgency",
      "needRequest.selectedUnits": "Selected Units",
      "needRequest.requiredUnits": "Required Units",
      "needRequest.remainingUnits": "Remaining Units",
      "needRequest.appointmentDate": "Appointment Date",
      "needRequest.confirmAssignment": "Confirm Assignment",
      "needRequest.fetchBloodUnitsError": "Failed to fetch blood units",
      "needRequest.bloodTypeNormalized":
        "Blood type was adjusted from '{{original}}' to '{{normalized}}' for compatibility matching",
      "needRequest.confirmFulfill":
        "Are you sure you want to mark this request as fulfilled? This will remove the assigned blood units from inventory.",
      "needRequest.markFulfilled": "Mark as Fulfilled",
      "needRequest.fulfillError": "Error fulfilling blood request",
      "needRequest.createdDate": "Created at",
      "needRequest.bloodRequestType": "Blood group",
      "needRequest.attachment": "Image",
      "needRequest.fullImage": "View Image",
      "needRequest.nav.createRequest": "Register Request",
      "needRequest.nav.searchBlood": "Search compatible blood group",
      "needRequest.nav.viewMyRequests": "View Registration",
      "needRequest.noCompatibleBloodUnits":
        "Do not have enough blood unit from storage",
      "needRequest.compatibleBloodUnits": "Compatible blood unit",
      "needRequest.status.rejected": "Rejected",
      "needRequest.reject": "Rejected",
      "needRequest.assignBloodUnits": "Assign blood unit",
      "needRequest.requestDetails": "Request Details",
      "needRequest.bloodType": "Blood Type",
      "needRequest.component": "Component",
      "needRequest.reason": "Reason",
      "needRequest.urgencyLevel": "Urgency Level",
      "needRequest.filterOptions": "Filter Options",
      "needRequest.sortBy": "Sort By",
      "needRequest.order": "Order",
      "needRequest.dateExpired": "Date Expired",
      "needRequest.ascending": "Ascending",
      "needRequest.descending": "Descending",
      "needRequest.all": "All",
      "needRequest.requestNotFound": "Request not found",
      "needRequest.fetchError": "Failed to fetch request details",
      "needRequest.remainingUnits": "Remaining Units",
      "needRequest.rejectionReason": "Reject reason",

      // Common
      common: {
        delete: "Delete",
        submitting: "Submitting...",
        processing: "Processing...",
        notAuthenticated: "Not authenticated",
        refresh: "Refresh",
        loading: "Loading...",
        actions: "Actions",
        yes: "Yes",
        no: "No",
        back: "Back",
        error: "Error",
        retry: "Try Again",
        cancel: "Cancel",
        close: "Close",
        accept: "Accept",
        select: "Select",
        bloodType: "Blood Type",
        volume: "Volume",
        quantity: "Quantity",
        dateAdded: "Date Added",
        dateExpired: "Date Expired",
        note: "Note",
        all: "All",
        sortBy: "Sort By",
        order: "Order",
        ascending: "Ascending",
        descending: "Descending",
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

      // Blood Storage
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
      "bloodStorage.addError": "Unable to add blood to storage!",
      "bloodStorage.deleteError": "Error when deleting blood unit!",
      "bloodStorage.confirmDelete":
        "Are you sure you want to delete this blood unit?",
      "bloodStorage.centerTitle": "Blood Management Center",
      "bloodStorage.overview": "Blood Storage Overview",
      "bloodStorage.loading": "Loading blood inventory data...",
      "bloodStorage.wholeBlood": "Whole Blood",
      "bloodStorage.plasma": "Plasma",
      "bloodStorage.platelets": "Platelets",
      "bloodStorage.redCells": "Red Cells",
      "bloodStorage.hideForm": "Hide Blood Entry Form",
      "bloodStorage.addToStorage": "Add Blood to Storage",
      "bloodStorage.manualEntry": "Add Blood to Storage (Manual Entry)",
      "bloodStorage.note": "Note",
      "bloodStorage.processing": "Processing...",
      "bloodStorage.addToInventory": "Add to Storage",
      "bloodStorage.inventoryHistory": "Blood Inventory History",
      "bloodStorage.fromDate": "From Date",
      "bloodStorage.toDate": "To Date",
      "bloodStorage.sourceType": "Source Type",
      "bloodStorage.all": "All",
      "bloodStorage.donation": "Donation",
      "bloodStorage.import": "Manual Entry",
      "bloodStorage.daysLeft": "Days Left",
      "bloodStorage.delete": "Delete",
      "bloodStorage.noRecords": "No matching records found.",
      "bloodStorage.showing": "Showing",
      "bloodStorage.of": "of",
      "bloodStorage.entries": "entries",
      "bloodStorage.prev": "Previous",
      "bloodStorage.next": "Next",
      "bloodStorage.rowsPerPage": "Rows per page",
      "bloodStorage.total": "Total",
      "bloodStorage.deleteTitle": "Delete this record",
      "bloodStorage.noUnits": "No blood units available",
      "bloodStorage.daysUntilExpiry": "Days Until Expiry",
      "bloodStorage.donorName": "Donor Name",
      "bloodStorage.availableUnits": "Available Units",
      "bloodStorage.compatibleUnits": "Compatible Blood Units",

      // Donate Request
      donateRequest: {
        title: "Blood Donation Registration",
        description:
          "Register to donate blood and help save lives. Your donation can make a difference.",
        bloodGroup: "Blood Group",
        selectBloodGroup: "Select blood group",
        component: "Blood Component",
        selectComponent: "Select component",
        donationDate: "Preferred Donation Date",
        submit: "Submit Registration",
        submitting: "Submitting...",
        successMessage:
          "Your donation registration has been submitted successfully. Our team will contact you soon.",
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
          rejected: "Rejected",
        },
        viewMedicalQuestions: "Medical Questions",
        medicalQuestionsTitle: "Medical Screening Questions",
        noMedicalData: "No medical screening data available",
        medicalHistory: "Medical History",
        noMedicalHistory: "No Blood Donation History",
        medicalHistoryTitle: "Blood Donation History",
        markRejected: "Mark as Rejected",
        noRequests: "No donation registrations found",
        donationType: "Donation type",
        markApproved: "Mark as Approved",
        markCompleted: "Mark as Completed",
        markCancelled: "Mark as Cancelled",
        rejectionModalTitle: "Reject Donation Request",
        rejectionReason: "Rejection Reason",
        rejectionReasonPlaceholder:
          "Please explain why this donation request is being rejected...",
        reasonRequired: "Reason is required",
        confirmReject: "Confirm Rejection",
        detailInfo: "Detail Infomation",
      },

      // Blood Components Compatibility
      bloodComponents: {
        title: "Blood Components Compatibility",
        description:
          "Different blood components have different compatibility rules",
        wholeBlood: {
          name: "Whole Blood",
          description:
            "Contains all components of blood (red cells, white cells, platelets, and plasma)",
          compatibility: "Follows standard ABO and Rh compatibility rules",
          notes: "Can be donated every 56 days",
        },
        redCells: {
          name: "Red Blood Cells",
          description: "Oxygen-carrying component of blood",
          compatibility: "Must follow ABO and Rh compatibility strictly",
          notes: "Most commonly transfused component",
        },
        platelets: {
          name: "Platelets",
          description: "Help blood clot and prevent bleeding",
          compatibility: "ABO compatibility preferred but not always required",
          notes: "Have a short shelf life of only 5 days",
        },
        plasma: {
          name: "Plasma",
          description:
            "Liquid component carrying proteins and other substances",
          compatibility:
            "Type AB is the universal plasma donor, while type O is the universal recipient",
          notes:
            "Plasma compatibility is the reverse of red cell compatibility",
        },
        universalNotes:
          "Always consult medical professionals for specific transfusion needs",
        searchTitle: "Find Compatible Blood",
        searchDescription:
          "Search for compatible blood types and components before making a request",
        yourBloodType: "Your Blood Type:",
        componentNeeded: "Blood Component Needed:",
        anyComponent: "-- Any Component --",
        selectBloodType: "-- Select Blood Type --",
        searchButton: "Search Compatible Blood",
        searching: "Searching...",
        resultsTitle: "Compatible Blood Types for",
        compatibilityNote:
          "Blood compatibility is determined by antigens present in your blood. The results show what blood types you can safely receive.",
        noResults:
          "No compatible blood units found for your criteria. Please contact a blood bank directly.",
        tableBloodType: "Blood Type",
        tableComponent: "Component",
        tableAvailableUnits: "Available Units",
        tableTotalVolume: "Total Volume (ml)",
        errorSelectBloodType: "Please select a blood type",
        universalDonor: "Universal Donor",
        universalRecipient: "Universal Recipient",
        componentInfo: "Component Information",
        transfusionGuidelines: "Transfusion Guidelines",
        compatible: "Compatible",
        notCompatible: "Not Compatible",
        limitedCompatibility: "Limited Compatibility",
      },
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
      "donateRequest.nav.medicalHealth": "Sức Khỏe Y Tế",
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
        contentRequired: "Nội dung câu hỏi là bắt buộc",
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
        cityHint: "Nhập tên thành phố. Vị trí sẽ được tự động mã hóa địa lý.",
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
          ban: "Cấm",
          unban: "Bỏ cấm",
          roleAdmin: "Quản trị viên",
          roleStaff: "Nhân viên",
          roleMember: "Thành viên",
          allRoles: "Tất cả",
          totalUsers: "Tổng số người dùng",
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
          description:
            "Một lần hiến máu có thể giúp cứu tới ba mạng sống. Máu hiến của bạn được tách thành hồng cầu, huyết tương và tiểu cầu, mỗi thành phần giúp đỡ các bệnh nhân khác nhau.",
        },
        screening: {
          title: "Khám Sức Khỏe Miễn Phí",
          description:
            "Mỗi lần hiến máu bao gồm kiểm tra sức khỏe cơ bản với huyết áp, nhiệt độ, mạch và mức hemoglobin - hoàn toàn miễn phí.",
        },
        community: {
          title: "Giảm Rủi Ro Sức Khỏe",
          description:
            "Hiến máu thường xuyên có thể giúp duy trì mức sắt khỏe mạnh và giảm stress oxy hóa trong cơ thể, thúc đẩy sức khỏe tổng thể tốt hơn.",
        },
        emergency: {
          title: "Tăng Cường Sức Khỏe Tim Mạch",
          description:
            "Hiến máu có thể giúp cải thiện lưu lượng máu và giảm nguy cơ bệnh tim bằng cách duy trì mức sắt khỏe mạnh.",
        },
        renewal: {
          title: "Tái Tạo Máu Đều Đặn",
          description:
            "Hiến máu thúc đẩy sản xuất các tế bào máu mới, giúp cơ thể bạn duy trì mức tế bào máu khỏe mạnh.",
        },
        hemochromatosis: {
          title: "Giảm Nguy Cơ Thừa Sắt",
          description:
            "Hiến máu thường xuyên có thể giúp giảm tình trạng thừa sắt và nguy cơ mắc bệnh hemochromatosis, đặc biệt ở nam giới.",
        },
      },

      // Blood Types Section
      bloodTypes: {
        title: "Nhóm Máu & Tương Thích",
        description:
          "Hiểu về nhóm máu là rất quan trọng cho việc truyền máu thành công. Đây là hướng dẫn nhanh về tính tương thích của nhóm máu.",
        canDonateTo: "Có thể hiến cho:",
        canReceiveFrom: "Có thể nhận từ:",
        universalDonor: "Người Cho Máu Toàn Cầu",
        allTypes: "Tất Cả Nhóm Máu",
        aPlus: {
          donateTo: "A+, AB+",
          receiveFrom: "A+, A-, O+, O-",
        },
        aMinus: {
          donateTo: "A+, A-, AB+, AB-",
          receiveFrom: "A-, O-",
        },
        bPlus: {
          donateTo: "B+, AB+",
          receiveFrom: "B+, B-, O+, O-",
        },
        bMinus: {
          donateTo: "B+, B-, AB+, AB-",
          receiveFrom: "B-, O-",
        },
        abPlus: {
          donateTo: "Chỉ AB+",
          receiveFrom: "Tất Cả Nhóm Máu",
        },
        abMinus: {
          donateTo: "AB+, AB-",
          receiveFrom: "A-, B-, AB-, O-",
        },
        oPlus: {
          donateTo: "A+, B+, AB+, O+",
          receiveFrom: "O+, O-",
        },
        oMinus: {
          donateTo: "Tất Cả Nhóm Máu",
          receiveFrom: "Chỉ O-",
        },
      },

      // Donation Process Section
      donationProcess: {
        title: "Quy Trình Hiến Máu",
        description:
          "Hiến máu là một quy trình đơn giản và dễ hiểu, mất khoảng một giờ từ đầu đến cuối.",
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
          description:
            "Nghỉ ngơi và thưởng thức đồ ăn nhẹ để bổ sung chất lỏng và năng lượng",
        },
      },

      // Testimonials Section
      testimonials: {
        title: "Lời Chứng Thực Từ Người Hiến Máu",
        quote1:
          "Tôi đã hiến máu hơn 10 năm nay. Chỉ mất một giờ của tôi, nhưng có ý nghĩa rất lớn đối với ai đó đang cần.",
        author1: "- Sarah Johnson",
        quote2:
          "Sau tai nạn của con trai tôi, cậu ấy cần nhiều lần truyền máu. Giờ tôi hiến máu thường xuyên để đền đáp và giúp đỡ những người khác như cậu ấy.",
        author2: "- Michael Rodriguez",
        quote3:
          "Đây là cách đơn giản để tạo ra sự khác biệt lớn. Tôi cảm thấy tuyệt vời khi biết việc hiến máu của mình trực tiếp giúp cứu sống!",
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
      "donateRequest.nav.viewAllRequests": "Xem tất cả đơn đăng ký ",
      "donateRequest.nav.viewMyRequests": "Đơn hiến máu",
      "donateRequest.nav.createRequest": "Đăng ký hiến máu",

      // Language Switcher
      "language.switch": "Ngôn Ngữ",
      "language.english": "English",
      "language.vietnamese": "Tiếng Việt",

      // Legal Pages
      "legal.terms.title": "Điều Khoản Dịch Vụ",
      "legal.terms.content": "Nội dung Điều Khoản Dịch Vụ ở đây...",
      "legal.privacy.title": "Chính Sách Bảo Mật",
      "legal.privacy.content": "Nội dung Chính Sách Bảo Mật ở đây...",

      // Need Request
      "needRequest.title": "Yêu Cầu Máu",
      "needRequest.description":
        "Yêu cầu máu cho bệnh nhân cần giúp đỡ. Cộng đồng người hiến máu của chúng tôi sẵn sàng hỗ trợ.",
      "needRequest.nav.viewAllRequests": "Đơn yêu cầu máu",
      "needRequest.bloodGroup": "Nhóm Máu",
      "needRequest.selectBloodGroup": "Chọn nhóm máu",
      "needRequest.component": "Thành Phần Máu",
      "needRequest.selectComponent": "Chọn thành phần máu",
      "needRequest.unit": "Đơn Vị",
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
      "needRequest.status.pending": "Chưa giải quyết",
      "needRequest.status.fulfilled": "Đã Hoàn Thành",
      "needRequest.status.expired": "Đã Hết Hạn",
      "needRequest.noRequests": "Không tìm thấy yêu cầu máu nào",
      "needRequest.assign": "Phân bổ",
      "needRequest.assignError": "Lỗi khi phân bổ đơn vị máu",
      "needRequest.markCompleted": "Đánh dấu đã hoàn tất",
      "needRequest.confirmComplete":
        "Bạn có chắc chắn muốn đánh dấu yêu cầu này đã hoàn tất?",
      "needRequest.completeError": "Lỗi khi hoàn tất yêu cầu",
      "needRequest.confirmDelete":
        "Bạn có chắc chắn muốn xóa yêu cầu máu này không?",
      "needRequest.requiredUnits": "Đơn vị cần thiết",
      "needRequest.appointmentDate": "Ngày hẹn",
      "needRequest.confirmAssignment": "Xác nhận phân công",
      "needRequest.fetchBloodUnitsError": "Không thể lấy dữ liệu đơn vị máu",
      "needRequest.bloodTypeNormalized":
        "Nhóm máu đã được điều chỉnh từ '{{original}}' thành '{{normalized}}' để phù hợp với tương thích",
      "needRequest.confirmFulfill":
        "Bạn có chắc chắn muốn đánh dấu yêu cầu này là đã hoàn thành? Điều này sẽ xóa các đơn vị máu được chỉ định khỏi kho.",
      "needRequest.markFulfilled": "Đánh dấu đã hoàn thành",
      "needRequest.fulfillError": "Lỗi khi hoàn thành yêu cầu máu",
      "needRequest.createdDate": "Ngày tạo đơn",
      "needRequest.bloodRequestType": "Nhóm máu",
      "needRequest.attachment": "Hình ảnh",
      "needRequest.fullImage": "Xem ảnh",
      "needRequest.nav.createRequest": "Đăng ký nhận máu",
      "needRequest.nav.searchBlood": "Tìm nhóm máu phù hợp",
      "needRequest.nav.viewMyRequests": "Đơn nhận máu",
      "needRequest.noCompatibleBloodUnits":
        "Không còn đơn vị máu thích hợp trong kho",
      "needRequest.compatibleBloodUnits": "Đơn vị máu thích hợp",
      "needRequest.status.rejected": "Đã từ chối",
      "needRequest.reject": "Từ chối",
      "needRequest.assignBloodUnits": "Giao túi máu",
      "needRequest.requestDetails": "Chi tiết đơn",
      "needRequest.bloodType": "Nhóm máu",
      "needRequest.component": "Thành phần",
      "needRequest.unitsRequired": "Đơn vị máu",
      "needRequest.reason": "Lý do yêu cầu",
      "needRequest.urgencyLevel": "Mức độ nguy cấp",
      "needRequest.filterOptions": "Tùy chọn lọc",
      "needRequest.sortBy": "Sắp xếp theo",
      "needRequest.order": "Thứ tự",
      "needRequest.dateExpired": "Ngày hết hạn",
      "needRequest.ascending": "Tăng dần",
      "needRequest.descending": "Giảm dần",
      "needRequest.all": "Tất cả",
      "needRequest.requestNotFound": "Không tìm thấy yêu cầu",
      "needRequest.fetchError": "Không thể tải chi tiết yêu cầu",
      "needRequest.rejectionReason": "Lý do từ chối",

      // Common
      common: {
        delete: "Xóa",
        submitting: "Đang gửi...",
        processing: "Đang xử lý...",
        notAuthenticated: "Chưa xác thực",
        refresh: "Làm mới",
        loading: "Đang tải...",
        actions: "Thao tác",
        back: "Quay lại",
        error: "Lỗi",
        retry: "Thử lại",
        cancel: "Hủy",
        yes: "Có",
        no: "Không",
        close: "Đóng",
        accept: "Chấp nhận",
        select: "Chọn",
        bloodType: "Nhóm máu",
        volume: "Thể tích",
        quantity: "Số lượng",
        dateAdded: "Ngày thêm",
        dateExpired: "Ngày hết hạn",
        note: "Ghi chú",
        all: "Tất cả",
        sortBy: "Sắp xếp theo",
        order: "Thứ tự",
        ascending: "Tăng dần",
        descending: "Giảm dần",
        role: {
          guest: "Khách",
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

      // Blood Storage
      "bloodStorage.title": "Blood Storage Management",
      "bloodStorage.staffOnly":
        "This page is for staff and administrators only.",
      "bloodStorage.summary": "Blood Storage Overview",
      "bloodStorage.detailedInventory": "Detailed Blood Inventory",
      "bloodStorage.addUnit": "Add Blood Unit",
      "bloodStorage.cancelAdd": "Cancel",
      "bloodStorage.refresh": "Refresh Data",
      "bloodStorage.addNewUnit": "Add New Blood Unit",
      "bloodStorage.bloodType": "Blood Type",
      "bloodStorage.component": "Component",
      "bloodStorage.volume": "Volume",
      "bloodStorage.dateAdded": "Date Added",
      "bloodStorage.expirationDate": "Expiration Date",
      "bloodStorage.daysUntilExpired": "Days Remaining",
      "bloodStorage.expired": "Expired",
      "bloodStorage.units": "Units",
      "bloodStorage.blood": "Blood",
      "bloodStorage.status": "Status",
      "bloodStorage.sufficient": "Sufficient",
      "bloodStorage.low": "Low",
      "bloodStorage.critical": "Critical",
      "bloodStorage.fetchError": "Error fetching blood storage data",
      "bloodStorage.addError": "Error adding blood unit",
      "bloodStorage.deleteError": "Error deleting blood unit",
      "bloodStorage.confirmDelete":
        "Are you sure you want to delete this blood unit?",
      "bloodStorage.noUnits": "No blood units available",
      "bloodStorage.inventoryHistory": "Lịch Sử Kho Máu",
      "bloodStorage.fromDate": "Từ Ngày",
      "bloodStorage.toDate": "Đến Ngày",
      "bloodStorage.sourceType": "Nguồn Gốc",
      "bloodStorage.all": "Tất Cả",
      "bloodStorage.donation": "Hiến Máu",
      "bloodStorage.import": "Nhập Thủ Công",
      "bloodStorage.daysLeft": "Ngày Còn Lại",
      "bloodStorage.delete": "Xóa",
      "bloodStorage.noRecords": "Không có kết quả phù hợp.",
      "bloodStorage.showing": "Hiển thị",
      "bloodStorage.of": "trong",
      "bloodStorage.entries": "mục",
      "bloodStorage.prev": "Trước",
      "bloodStorage.next": "Sau",
      "bloodStorage.rowsPerPage": "Số dòng mỗi trang",
      "bloodStorage.total": "Tổng cộng",

      // Donate Request
      donateRequest: {
        title: "Đăng Ký Hiến Máu",
        description:
          "Đăng ký hiến máu và giúp cứu sống những người cần máu. Sự hiến tặng của bạn có thể tạo ra sự khác biệt.",
        bloodGroup: "Nhóm Máu",
        selectBloodGroup: "Chọn nhóm máu",
        component: "Thành Phần Máu",
        selectComponent: "Chọn thành phần",
        donationDate: "Ngày Hiến Máu Mong Muốn",
        submit: "Gửi Đăng Ký",
        submitting: "Đang gửi...",
        successMessage:
          "Đăng ký hiến máu của bạn đã được gửi thành công. Đội ngũ của chúng tôi sẽ liên hệ với bạn sớm.",
        submitError: "Lỗi khi gửi đăng ký. Vui lòng thử lại.",
        listTitleAll: "Tất Cả Đăng Ký Hiến Máu",
        listTitleMy: "Đăng Ký Hiến Máu Của Tôi",
        filterByStatus: "Lọc theo Trạng Thái",
        allStatuses: "Tất Cả Trạng Thái",
        status: {
          open: "Đang Mở",
          approved: "Đã Duyệt",
          completed: "Đã Hoàn Thành",
          cancelled: "Đã Hủy",
          pending: "Đang Chờ",
          rejected: "Đã Từ Chối",
        },
        viewMedicalQuestions: "Câu Hỏi Y Tế",
        medicalQuestionsTitle: "Câu hỏi sàng lọc y tế",
        noMedicalData: "Không có dữ liệu sàng lọc y tế",
        medicalHistory: "Lịch sử bệnh",
        noMedicalHistory: "Không có lịch sử hiến máu",
        medicalHistoryTitle: "Lịch sử hiến máu",
        historyTitleAll: "Lịch Sử Hiến Máu",
        historyTitleMy: "Lịch Sử Hiến Máu Của Tôi",
        createdAt: "Tạo Lúc",
        completedAt: "Hoàn Thành Lúc",
        rejectionReason: "Lý Do Từ Chối",
        donationType: "Thể loại hiến máu",
        quantity: "Số lượng",
        markApproved: "Phê Duyệt",
        markCompleted: "Hoàn Thành",
        markCancelled: "Đánh Dấu Đã Hủy",
        rejectionModalTitle: "Từ Chối Yêu Cầu Hiến Máu",
        rejectionReasonPlaceholder:
          "Vui lòng giải thích lý do từ chối yêu cầu hiến máu này...",
        reasonRequired: "Lý do là bắt buộc",
        confirmReject: "Xác Nhận Từ Chối",
        noRequests: "Không có yêu cầu hiến máu nào",
        healthCheck: "Kiểm Tra Sức Khỏe",
        healthCheckTitle: "Biểu Mẫu Kiểm Tra Sức Khỏe",
        completeTab: "Hoàn Thành Hiến Máu",
        cancelTab: "Hủy Hiến Máu",
        weight: "Cân Nặng",
        height: "Chiều Cao",
        bloodPressure: "Huyết Áp",
        heartRate: "Nhịp Tim",
        alcoholLevel: "Nồng Độ Cồn",
        temperature: "Nhiệt Độ",
        hemoglobin: "Hemoglobin",
        invalidQuantity: "Vui lòng nhập số lượng hợp lệ (tối thiểu 1)",
        cancellationReason: "Lý Do Hủy",
        cancellationReasonPlaceholder:
          "Vui lòng giải thích lý do hủy hiến máu này",
        followUpDate: "Ngày Hẹn Tái Khám",
        confirmComplete: "Hoàn Thành Hiến Máu",
        confirmCancel: "Hủy Hiến Máu",
        followUpDateRequired: "Vui lòng chọn ngày hẹn tái khám",
        completedSuccessfully: "Hiến máu đã được hoàn tất thành công!",
        canceledSuccessfully: "Hiến máu đã bị hủy thành công!",
        bloodGroupError: "Nhóm máu không đúng",
        bloodGroupMismatch: "Nhóm máu được chọn không khớp với hồ sơ của bạn",
        detailInfo: "Thông tin chi tiết",
      },

      // Blood Components Compatibility
      bloodComponents: {
        title: "Tương Thích Thành Phần Máu",
        description:
          "Các thành phần máu khác nhau có quy tắc tương thích khác nhau",
        wholeBlood: {
          name: "Máu Toàn Phần",
          description:
            "Chứa tất cả các thành phần của máu (hồng cầu, bạch cầu, tiểu cầu và huyết tương)",
          compatibility: "Tuân theo quy tắc tương thích ABO và Rh tiêu chuẩn",
          notes: "Có thể hiến mỗi 56 ngày",
        },
        redCells: {
          name: "Hồng Cầu",
          description: "Thành phần mang oxy của máu",
          compatibility: "Phải tuân thủ nghiêm ngặt tính tương thích ABO và Rh",
          notes: "Thành phần được truyền phổ biến nhất",
        },
        platelets: {
          name: "Tiểu Cầu",
          description: "Giúp máu đông và ngăn chảy máu",
          compatibility:
            "Ưu tiên tương thích ABO nhưng không phải lúc nào cũng bắt buộc",
          notes: "Có thời hạn sử dụng ngắn chỉ 5 ngày",
        },
        plasma: {
          name: "Huyết Tương",
          description: "Thành phần lỏng chứa protein và các chất khác",
          compatibility:
            "Nhóm AB là người cho huyết tương toàn cầu, trong khi nhóm O là người nhận toàn cầu",
          notes: "Tính tương thích huyết tương ngược với tương thích hồng cầu",
        },
        universalNotes:
          "Luôn tham khảo ý kiến chuyên gia y tế cho nhu cầu truyền máu cụ thể",
        searchTitle: "Find Compatible Blood",
        searchDescription:
          "Search for compatible blood types and components before making a request",
        yourBloodType: "Your Blood Type:",
        componentNeeded: "Blood Component Needed:",
        anyComponent: "-- Any Component --",
        selectBloodType: "-- Select Blood Type --",
        searchButton: "Search Compatible Blood",
        searching: "Đang tìm kiếm...",
        resultsTitle: "Nhóm Máu Tương Thích cho",
        compatibilityNote:
          "Tính tương thích của máu được xác định bởi kháng nguyên có trong máu của bạn. Kết quả cho thấy loại máu nào bạn có thể nhận an toàn.",
        noResults:
          "Không tìm thấy đơn vị máu tương thích với tiêu chí của bạn. Vui lòng liên hệ trực tiếp với ngân hàng máu.",
        tableBloodType: "Nhóm Máu",
        tableComponent: "Thành Phần",
        tableAvailableUnits: "Đơn Vị Có Sẵn",
        tableTotalVolume: "Tổng Thể Tích (ml)",
        errorSelectBloodType: "Vui lòng chọn nhóm máu",
        universalDonor: "Người Cho Toàn Cầu",
        universalRecipient: "Người Nhận Toàn Cầu",
        componentInfo: "Thông Tin Thành Phần",
        transfusionGuidelines: "Hướng Dẫn Truyền Máu",
        compatible: "Tương Thích",
        notCompatible: "Không Tương Thích",
        limitedCompatibility: "Tương Thích Có Giới Hạn",
      },
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
