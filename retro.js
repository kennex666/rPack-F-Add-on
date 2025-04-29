const navBar = document.querySelector('div[role="banner"]');
const links = navBar.querySelectorAll("a[role='link']");

const rootLinks = Array.from(links).map((link) => link.closest("li"));

const leftBar = navBar.querySelectorAll(
	"div[aria-label='Account Controls and Settings']"
);

const childrenButtons = Array.from(leftBar).flatMap((button) =>
	Array.from(button.children)
);

const getNavBarFull = () => {
	// Tính vùng bao phủ lớn nhất của tất cả phần tử con
	const allElements = navBar.querySelectorAll("*");

	// Tính vùng chứa lớn nhất bằng getBoundingClientRect()
	let bounding = navBar.getBoundingClientRect();

	allElements.forEach((el) => {
		const rect = el.getBoundingClientRect();
		const right = Math.max(bounding.right, rect.right);
		const bottom = Math.max(bounding.bottom, rect.bottom);
		const left = Math.min(bounding.left, rect.left);
		const top = Math.min(bounding.top, rect.top);
		bounding = {
			top,
			left,
			right,
			bottom,
			width: right - left,
			height: bottom - top,
		};
	});

	console.log("📏 Kích thước full của navBar:", bounding);
	return bounding;
};

const hideNavBar = () => {
	navBar.style.opacity = 0;
	navBar.style.pointerEvents = "auto";
};

const getUserProfile = () => {
	const profileButton = [
		...document.querySelectorAll('div[role="button"]'),
	].find((btn) =>
		btn.getAttribute("aria-label")?.toLowerCase().includes("your profile")
	);

	const avatarImg = profileButton?.querySelector("image");
	const avatarUrl = avatarImg?.getAttribute("xlink:href");

	console.log("Ảnh đại diện:", avatarUrl);
	return avatarUrl;
};

const getUserFullName = () => {
	const profileLink = document.querySelector('a[aria-label$="Timeline"]');
	const ariaLabel = profileLink?.getAttribute("aria-label");
	const name = ariaLabel?.split("'s")[0]; // => "Bao Duong"
	console.log(name);
	return name;
};

const replaceNavBar = () => {
	const bounding = getNavBarFull();
	const avatarUrl = getUserProfile();
	// Tạo thanh nav mới đè lên đúng vị trí
	const fbNavClone = document.createElement("div");
	Object.assign(fbNavClone.style, {
		position: "fixed",
		top: `0px`,
		left: `0px`,
		width: `100dvw`,
		height: `${bounding.height - 15}px`,
		backgroundColor: "#4B669D",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "0 7vw",
		color: "white",
		fontFamily: "Segoe UI, sans-serif",
		zIndex: 999999,
		boxSizing: "border-box",
		borderBottom: "1px solid rgba(255,255,255,0.1)",
		boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
	});

	const logoFb = `data:image/png;base64,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`;
	fbNavClone.innerHTML = `
	<div style="display: flex; align-items: center; justify-content:center; gap: 12px;">
		<img style="height: 29px; width: 29px;" src="${logoFb}" >
		<input type="text" placeholder="Search Facebook" 
			style="border:none; padding: 0px 10px; font-size: 0.8rem; width: 30vw; max-width: 400px; height: 30px; outline: none">
	</div>
	<div style="display: flex; align-items: center; gap: 18px; font-size: 0.8rem;">
        <div style="display: flex; gap: 8px; align-items: center; justify-content: center;">
	<a href="/me" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: white;">
		<img src="${avatarUrl}" alt="avatar" style="height: 28px; width: 28px; border-radius: 50%; object-fit: cover;">
		<span style="font-weight: 500;">${getUserFullName()}</span>
	</a>
</div>

		<a href="/home"  style="color: white">Home</a>
		<span title="Friends">👥</span>
		<span title="Messages">💬</span>
		<span title="Notifications">🔔</span>
		<span title="Help">❓</span>
		<span title="Menu">▾</span>
	</div>
`;

	document.body.appendChild(fbNavClone);
};

hideNavBar();
replaceNavBar();
