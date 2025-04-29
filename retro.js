const navBar = document.querySelector('div[role="banner"]');
const links = navBar.querySelectorAll("a[role='link']");

const rootLinks = Array.from(links).map(link => link.closest('li'));

const leftBar = navBar.querySelectorAll("div[aria-label='Account Controls and Settings']");

const childrenButtons = Array.from(leftBar).flatMap(button => Array.from(button.children));

const getNavBarFull = () => {

	// Tính vùng bao phủ lớn nhất của tất cả phần tử con
	const allElements = navBar.querySelectorAll('*');

	// Tính vùng chứa lớn nhất bằng getBoundingClientRect()
	let bounding = navBar.getBoundingClientRect();

	allElements.forEach(el => {
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
			height: bottom - top
		};
	});

	console.log('📏 Kích thước full của navBar:', bounding);
	return bounding;
}

const hideNavBar = () => {
	navBar.style.opacity = 0;
	navBar.style.pointerEvents = 'auto';
}


const replaceNavBar = () => {
	const bounding = getNavBarFull();
	// Tạo thanh nav mới đè lên đúng vị trí
const fbNavClone = document.createElement('div');
Object.assign(fbNavClone.style, {
	position: 'fixed',
	top: `0px`,
	left: `0px`,
	width: `100vw`,
	height: `${bounding.height - 10}px`,
	backgroundColor: '#4B669D',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '0 5vw',
	color: 'white',
	fontFamily: 'Segoe UI, sans-serif',
	zIndex: 999999,
	boxSizing: 'border-box',
	borderBottom: '1px solid rgba(255,255,255,0.1)',
	boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});

fbNavClone.innerHTML = `
	<div style="display: flex; align-items: center; gap: 12px;">
		<div style="font-weight: bold; font-size: 20px;">📘</div>
		<input type="text" placeholder="Search Facebook" 
			style="padding: 4px 10px; font-size: 14px; width: 30vw;">
	</div>
	<div style="display: flex; align-items: center; gap: 18px; font-size: 18px;">
		<span style="font-size: 14px;">Janay</span>
		<span style="font-size: 14px;">Home</span>
		<span title="Friends">👥</span>
		<span title="Messages">💬</span>
		<span title="Notifications">🔔</span>
		<span title="Help">❓</span>
		<span title="Menu">▾</span>
	</div>
`;

document.body.appendChild(fbNavClone);
}

hideNavBar();
replaceNavBar();