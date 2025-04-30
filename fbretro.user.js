// ==UserScript==
// @name         Facebook Retro
// @namespace    http://1boxstudios.com/
// @version      1.0.1
// @description  Facebook Retro UI (201x)
// @author       Kennex666
// @match        https://*.facebook.com/*
// @grant        none
// @run-at       document-idle
// @downloadURL  https://github.com/kennex666/rPack-F-Add-on/raw/refs/heads/main/fbretro.user.js

// ==/UserScript==

(function () {
	"use strict";

	const navBar = document.querySelector('div[role="banner"]');
	const links = navBar.querySelectorAll("a[role='link']");
	var lastPath = "unknown";

	const rootLinks = Array.from(links).map((link) => link.closest("li"));

	const leftBar = navBar.querySelectorAll(
		"div[aria-label='Account Controls and Settings']"
	);

	const childrenButtons = Array.from(leftBar).flatMap((button) =>
		Array.from(button.children)
	);
	
	const allButtonFacebook = Array.from(document.querySelectorAll('div[role="button"]'));
	
	const notificationButton = allButtonFacebook.find(btn =>
		btn.getAttribute("aria-label").includes('Notifications') || btn.getAttribute("aria-label").match(/Notifications,? \d+/)
	);
	
	const messengerButton = allButtonFacebook.find(btn =>
		btn.getAttribute("aria-label").includes('Messenger') || btn.getAttribute("aria-label").match(/Messenger,? \d+/)
	);

	const yourProfileButton = document.querySelector(
		'[aria-label="Your profile"]'
	);

	// search action
	const toggles = {
		notifications: false,
		messenger: false,
		yourProfile: false,
	};

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

	const queryLinkHelper = (links, ariaLabel) => {
		return Array.from(links).find((link) =>
			link.getAttribute("aria-label")?.toLowerCase().includes(ariaLabel)
		);
	};

	const queryProfileLink = () => {
		return document.querySelector('a[aria-label$="Timeline"]');
	};

	const getUserProfile = () => {
		const profileButton = [
			...document.querySelectorAll('div[role="button"]'),
		].find((btn) =>
			btn
				.getAttribute("aria-label")
				?.toLowerCase()
				.includes("your profile")
		);

		const avatarImg = profileButton?.querySelector("image");
		const avatarUrl = avatarImg?.getAttribute("xlink:href");

		console.log("Ảnh đại diện:", avatarUrl);
		return avatarUrl;
	};

	const getUserFullName = () => {
		const profileLink = queryProfileLink();
		const ariaLabel = profileLink?.getAttribute("aria-label");
		const name = ariaLabel?.split("'s")[0]; // => "Bao Duong"
		console.log(name);
		return name;
	};

	const navBarVisibility = (state) => {
		const fbNav = navBar;
		if (fbNav) {
			fbNav.style.opacity = state ? "1" : "0";
			fbNav.style.pointerEvents = state ? "auto" : "none";
		}
	};

	function getCountNotification(button) {
		// Nếu có aria-label dạng "Notifications, 1 unread" thì lấy số
		const ariaLabel = button.getAttribute("aria-label") || "";
		const match = ariaLabel.match(/\b(\d+)\b/);
		const count = match ? parseInt(match[1]) : 0;
		return count;
	}

	function observeToggle({ button, key, labelName, onToggle }) {
		if (!button) return;

		const observer = new MutationObserver(() => {
			const expanded = button.getAttribute("aria-expanded") === "true";
			console.log(`📌 ${labelName} mở ra?`, expanded);

			// Bật/tắt UI
			navBarVisibility(expanded);
			toggles[key] = expanded;

			// Nếu có aria-label dạng "Notifications, 1 unread" thì lấy số
			const count = getCountNotification(button);

			updateNotificationBadge(key, count);

			if (typeof onToggle === "function") onToggle(expanded, count);
		});

		observer.observe(button, {
			attributes: true,
			attributeFilter: ["aria-expanded", "aria-label"],
		});
	}

	function listenModel() {
		observeToggle({
			button: notificationButton,
			key: "notifications",
			labelName: "Notifications",
		});

		observeToggle({
			button: messengerButton,
			key: "messenger",
			labelName: "Messenger",
		});

		observeToggle({
			button: yourProfileButton,
			key: "yourProfile",
			labelName: "Your Profile",
		});
	}


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

		const friendIco = `data:image/png;base64,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`;

		const messageIco = `data:image/png;base64,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`;

		const notifyIco = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAACXBIWXMAAAzrAAAM6wHl1kTSAAAE2GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA0LTI5PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjZhZjhhODg4LWY1YTItNDJmYS1hMzg0LTI0NTI2M2IzMjExNjwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5UaGnhur90IGvhur8gY2jGsGEgY8OzIHTDqm4gLSA0PC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpwZGY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8nPgogIDxwZGY6QXV0aG9yPkLhuqNvIETGsMahbmcgVGjDoWk8L3BkZjpBdXRob3I+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnhtcD0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyc+CiAgPHhtcDpDcmVhdG9yVG9vbD5DYW52YSAoUmVuZGVyZXIpIGRvYz1EQUdtRGFRTGpjQSB1c2VyPVVBRm9SRFQ2TWVNIGJyYW5kPVRlYW0gdnVpIDgvMjAyMyAoIDIgKSB0ZW1wbGF0ZT08L3htcDpDcmVhdG9yVG9vbD4KIDwvcmRmOkRlc2NyaXB0aW9uPgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSdyJz8+XmuCBQAABxdJREFUeJztl21sVXcdxz/f/723t/eWtpeW23YU2gMUEVm6jg0Qx9YydbNhgTl5oWYxI4aZZVmiRpNlui0mPsxo5lOMc28mr8xwLtmii0rmKBmLCJPHKQXKbktpgbZw297bx3vuzxf33tLSwpjzgRf+kn9ycs7//zuf83s+4gYS/a8Bpsv/Ya4mHxympSWnY/du+6/DeJ6nBOABw0EvFHR+sbJZFyAwkV61bTQ2uIOEmXmdnSQSif8czH1bHwy1n5qoi1QtWxdwusOMpcgqMQJIabBuGQeGLnW2DQ92H2/96JKRHTt2XLfFrgumuMZzt9zy4OIJ+Y8Y2gx4mDkhEALD8hdmhqQBM/a6oP+zs5VuX2TPryeux0qBaz71PNiyRU3ROzZlZL8y0SqYL+QASciQ5WlMyt1HioCtMHMPzEsrMlm56O1LHQfG/3WY5mai27e7lQf9L5lzT0gWAQYFE2Y4XT7bj3QBWQ9GqSAkSUgSVoSxrphIg09mz0jjshE6O6/6yuDVHkSOnQ5+KNrzORFcl+rv3D6c7LqIYWDhm1a1VjCWbsBZVerSmV2p/iXJ2qUu4zv/eyYeEOQciEAWwuz+RQ0tfmzNki8vhIttbW3Xb5mWlhaVL2293XzXKpd9NRipdDUl7sg/yof7Ugf3nD/X/udOv2LsULj/6N72Q6+fXVDukpGauvXAozJKkKZiUbmwdMCqop7kUG9X+77Biz3Z64LxPI+BobLSSEX9DwV3g74AbDrTeXhv6mJXF8kkACM9PfT19RlAMpmw4gWLz4WLY5uRblKBo7AkkDDpIz7BPWWfWN2bPHx4FoybA1BlDXfeaUaLQbWhkLAsZhPenMZFTZue+nCsrO45YSs0M0MtvzBDmFWXzq/f1nfk9FzvnQ0Ti3kqcrYVVFKwsYm34uV658q9K7/6Ddew9vM3KzP5DOIzhuYVADHLRRhmZpbHkSG7u2zY6j3Pm1VWZsDE43H1DvvVmK1FU98ljD8UB8ZGE4lELt2BpvsfcsF23TNvvveSQauBprkHBJbTcVzSL4R7VsZZoGbZitubEonErGI4A6avpMQk6oD5kC8kMgPdduZieB5A3C2uqVl2Z/NI98SSQCb7E0EduYJzGYScXQRHhmPu0yNNy79ePn72yXRM95rxYjoTudVreXqWZWamdiJBtHFD3CA6pdiQsM01y+86NzbQ/e3a5RueEmwE9QA1CKcC+TTJx87uzOF5Zzr2fSvTnkhAc3PHmvD6FyadHo5eKCnYfm7LAJRV15UCAVl+n4RBHHhkyW1bNwCvgn6ObDWysOWMUAjUacplWHbfts+OZym0grY2ujreTJLF4SWufPVsmNLg2ARgJhmX/S8ZlYRCL0t6zMj6ZjpkpjcEvwW68rFKASjXH1zDzp07rRBnLS0tclIm11Rny0w3eR4nT+zvr2nYMA6E84olZJYLilJhH5dcI2bPLygu+jHZ85lL4xWLM85+ZNJGzNxUOzC2FS3eMt4k/PRavXse99f4WH8IGOjrK7l2AK+JxyVZN1Lyin057XmfmVkFWTe4q+e11K6jx8cO/OmTJwnwuMzeAaXymSxEvdB3ZTwzb8iejQxlS0KxylqRTfTt/8G1YfZHozY00N0ls/bLYTATKp/AmcFk9hz79xuJ3QYb7dDv3zrae/rNTdHg6OPC0kA2tx9nwgFx3+djPtlbe0/tPRaPx69dZ2hrIxpMZ4zAK4CfD5kriSQoLq/Uw/fe92SM5ubCYSpCA/0jmXAWEVQuu6aWGcVythyjVItqjxVaydVhgJKSEkudP/FHiaOWr6KzJDdFrT83OfmV0kELFW739XkmqcqgyMymbVch8+tN2tvrhcfm0Dq7USaTScb8dKqitnFUxqckBTCbXkempgOHWzC20nspXao0khbVLl8Xisz/GqJaKpSafFPIXR8727H7lyNv/G7iumAAJkeSlh7gRGVtXSWiCeRgJpAQhildFtiRutg52ODdU1oSqngFWJlzUaFmGkKG0Z5uXPposDJ9Ya6ODXN3bQBS5WfGSzOpbwIvIzL5LzQuO04SpQu7xqrL/t7houOhLwJLC7w2BYIZtEfc6EMnf/OdjsQ1BvSrj53JJLILk/XLVu9JjWaL5FhlUCSEycCEIGDOHQ+GY2cj0dj3EVW5+pgvgNIkaG96oPOxw23PHyzMQu8fhlz8+OnOse53D++prL/5OFl5QjFEMDcO5GbycDQ2AraN/JyJ4SN6zPTT80PtT7vz+04l3wPkPWEKQBOjg37xwlB799/ci1ULy45mRQYjiogC1YIJg3qhIcz+EvCzz40M9DxhA0dfu6uxKnW1mfdKeX9/lJ5HPB5XqGxl2PcWFS/snajys+EKfAtkccPj/SfPDS8Ipwfffn20uixkc80s/z6Yuc5Pqye5cPkgym4guaFg/glkFCbIaS8AAgAAAABJRU5ErkJggg==`;

		fbNavClone.innerHTML = `
	<div style="display: flex; align-items: center; justify-content:center; gap: 12px;">
		<a href="/"><img style="height: 29px; width: 29px;" src="${logoFb}" ></a>
		<input custom-handler="search" type="text" placeholder="Search" 
			style="border:none; padding: 0px 10px; font-size: 0.8rem; width: 30vw; max-width: 400px; height: 30px; outline: none">
	</div>
	<div style="display: flex; align-items: center; justify-content:center; gap: 18px; font-size: 0.8rem;">
        <div custom-action="profile" style="display: flex; gap: 8px; align-items: center; justify-content: center;">
            <img src="${avatarUrl}" alt="avatar" style="height: 28px; width: 28px; object-fit: cover;">
            <span style="">${getUserFullName()}</span>
        </div>

		<div custom-action="home" style="color: white">Home</div>
		<div custom-action="friend" title="Friends" style="display: flex; align-items: center; justify-content: center;">
            <img src="${friendIco}" alt="friend" style="height: 24px; width: 24px; object-fit: cover; padding-top: 3px">
        </div>
		<div custom-action="messenger" title="Messages" style="position: relative; display: flex; align-items: center; justify-content: center;">
			<img src="${messageIco}" alt="message" style="height: 24px; width: 24px; object-fit: cover;">
		</div>
		
		<div custom-action="notifications" title="Notifications" style="position: relative; display: flex; align-items: center; justify-content: center;">
			<img src="${notifyIco}" alt="notify" style="height: 24px; width: 24px; object-fit: cover;">
		</div>
		
		<div custom-action="menu" title="Menu" style="display: flex; align-items: center; justify-content: center;">
			<span title="Menu" style="font-size: 1.5rem; color: #31487a">▾</span>
        </div>
	</div>
`;
		const actions = {
			profile: () => {
				console.log("👤 Về trang cá nhân");
				const profileButton = queryProfileLink();
				profileButton?.click();
			},
			home: () => {
				queryLinkHelper(links, "home")?.click();
				console.log("🏠 Về trang chủ");
			},
			friend: () => {
				queryLinkHelper(links, "friends")?.click();
				console.log("👫 Về trang bạn bè");
			},
			notifications: () => {
				if (!toggles.notifications) {
					notificationButton?.click();
				}
			},
			messenger: () => {
				if (!toggles.messenger) {
					messengerButton?.click();
				}
			},

			menu: () => {
				if (!toggles.yourProfile) {
					yourProfileButton?.click();
				}
			},
		};

		const handlers = {
			search: (inputOverlay) => {
				const searchBarOriginal =
					document.querySelector('[type="search"]');

				if (!searchBarOriginal) return;

				// Lấy setter gốc của .value
				const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
					window.HTMLInputElement.prototype,
					"value"
				).set;

				const syncInput = () => {
					requestAnimationFrame(() => {
						searchBarOriginal.click();

						nativeInputValueSetter.call(
							searchBarOriginal,
							inputOverlay.value
						);

						searchBarOriginal.dispatchEvent(
							new Event("input", { bubbles: true })
						);
						searchBarOriginal.dispatchEvent(
							new KeyboardEvent("keyup", {
								bubbles: true,
								key: inputOverlay.value.slice(-1) || "a",
							})
						);
					});
				};

				inputOverlay.addEventListener("keyup", syncInput);
				inputOverlay.addEventListener("focus", () => {
					navBarVisibility(true);
					setTimeout(() => {
						requestAnimationFrame(() => {
							searchBarOriginal.click();
						});
					}, 200);
				});
				inputOverlay.addEventListener("blur", () => {
					searchBarOriginal.blur();
					setTimeout(() => {
						navBarVisibility(false);
					}, 100);
				});
			},
		};

		fbNavClone.querySelectorAll("[custom-action]").forEach((el) => {
			const action = el.getAttribute("custom-action");
			// add hover
			el.addEventListener("mouseenter", () => {
				el.style.cursor = "pointer";
				el.style.color = "rgba(255, 255, 255, 0.8)";
			});
			el.addEventListener("mouseleave", () => {
				el.style.cursor = "default";
				el.style.color = "white";
			});
			el.addEventListener("click", (e) => {
				e.stopPropagation();
				actions[action]?.();
			});
		});

		// custom-handle
		fbNavClone.querySelectorAll("[custom-handler]").forEach((el) => {
			const action = el.getAttribute("custom-handler");
			// add hover
			handlers[action]?.(el);
		});

		document.body.appendChild(fbNavClone);
		
		notificationUpdate();
	};

	const notificationUpdate = () => {
		updateNotificationBadge(
			"messenger",
			getCountNotification(messengerButton)
		);
		updateNotificationBadge(
			"notifications",
			getCountNotification(notificationButton)
		)
	}

	const shortcutNavBar = () => {
		const shortcutNavBar = document.querySelector(
			"[aria-label='Shortcuts'][role='navigation']"
		);
		if (!shortcutNavBar) return;
		shortcutNavBar.classList.add("retro-shortcut-nav");

		addStyle(`
		.retro-shortcut-nav{
			width: 15vw !important;
			max-width: 15vw !important;
		}
	.retro-shortcut-nav * {
		border-radius: 0 !important;
		margin: 0 !important;
		padding: 0 !important;
		font-size: 0.8rem !important;
		max-width: 15vw !important;
	}
		
	.retro-shortcut-nav {
		border-radius: 0 !important;
		margin: 0 !important;
		padding: 0 !important;
		font-size: 0.8rem !important;

	}
	.retro-shortcut-nav{
		margin-left: 15px !important;
	}
		
	div[role="separator"] {
		padding-top: 6px !important;
		margin-bottom: 9px !important;
	}
	.retro-shortcut-item div {
		gap: 6px
	}
	`);

		if (shortcutNavBar) {
			// find all li
			const shortcutItems = shortcutNavBar.querySelectorAll("li");
			shortcutItems.forEach((item) => {
				const div = item.querySelector("div");
				item.classList.add("retro-shortcut-item");
			});

			shortcutNavBar
				.querySelectorAll("i[style*='background-image']")
				.forEach((icon) => {
					const targetSize = 24; // Kích thước muốn hiển thị
					const originalSize = 36; // Kích thước gốc mỗi icon
					const spriteHeight = 555; // Chiều cao toàn ảnh

					const scale = targetSize / originalSize;

					// Resize width/height
					icon.style.width = `${targetSize}px`;
					icon.style.height = `${targetSize}px`;

					// Scale background-size (giữ tỷ lệ ảnh gốc)
					icon.style.backgroundSize = `auto ${
						spriteHeight * scale
					}px`;

					// Scale background-position để giữ đúng icon
					const posMatch = icon.style.backgroundPosition.match(
						/(-?\d+)px\s+(-?\d+)px/
					);
					if (posMatch) {
						const posX = parseInt(posMatch[1]) * scale;
						const posY = parseInt(posMatch[2]) * scale;
						icon.style.backgroundPosition = `${posX}px ${posY}px`;
					}
				});

			shortcutNavBar.querySelectorAll("img").forEach((img) => {
				img.style.width = "24px";
				img.style.height = "24px";
				img.style.objectFit = "cover";
			});

			shortcutNavBar.querySelectorAll("image").forEach((img) => {
				img.style.width = "24px";
				img.style.height = "24px";
				img.style.objectFit = "cover";
			});

			shortcutNavBar.querySelectorAll("mask").forEach((img) => {
				img.remove();
			});
			// circle
			shortcutNavBar.querySelectorAll("circle").forEach((img) => {
				img.remove();
			});

			shortcutNavBar.querySelectorAll("svg").forEach((svg) => {
				const closest = svg.closest("div");
				if (closest) {
					closest.style.width = "24px";
					closest.style.height = "24px";
				}
				svg.style.width = "24px";
				svg.style.height = "24px";
				svg.style.objectFit = "cover";
			});

			shortcutNavBar
				.querySelectorAll("[role='button']")
				.forEach((item) => {
					item.style.fontSize = "0.8rem";
				});
		}
	};

	const listenChangePath = () => {
		setInterval(() => {
			const newPath = location.pathname;
			if (newPath !== lastPath) {
				lastPath = newPath;

				console.log("🔁 Path changed to:", newPath);

				// Ví dụ: thêm class cho main khi ở home
				const mainEl = document.querySelector("div[role='main']");
				if (mainEl) {
					mainEl.classList.toggle("mainPost", newPath === "/");
				}
			}
		}, 300); // check mỗi 300ms
	};

	const listenDomUpdateOnly = () => {
		return setInterval(() => {
			document.querySelectorAll("mask").forEach((img) => {
				img.remove();
			});
			// circle
			document.querySelectorAll("circle").forEach((img) => {
				img.remove();
			});
		}, 300); // check mỗi 300ms
	};

	const addStyle = (css) => {
		const style = document.createElement("style");
		style.type = "text/css";
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
	};
	
	function updateNotificationBadge(key, count) {
		console.log("🔔 Cập nhật badge thông báo:", key, count);
		const wrapper = document.querySelector('[custom-action="' + key + '"]');

		if (!wrapper) return;


		let badge = wrapper.querySelector(".badge");

		if (!badge) {
			badge = document.createElement("span");
			badge.className = "badge";
			wrapper.appendChild(badge);
		}

		if (count > 0) {
			badge.textContent = count > 99 ? "99+" : count;
			badge.style.display = "flex";
		} else {
			badge.style.display = "none";
		}
	}
	const init = () => {
		// Chạy hàm này khi DOM đã được tải xong
		console.log("🚀 Đã khởi động Retro");
		// Ép vuông vức :))
		// addStyle(`
		//     * {
		//         border-radius: 0 !important;
		//     }
		// `);
		// document.querySelectorAll("[aria-posinset]")

		// Post vuông, card vuông

		addStyle(`
        :root {
		--card-corner-radius: 0 !important;
	    }

        [aria-posinset], 
            [aria-posinset] * {
                border-radius: 0 !important;
            }
        `);

		// Bảng vuông (story)
		addStyle(`
        [role="grid"], 
        [role="grid"] * {
            border-radius: 0 !important;
        }
    `);

		// Ép các component vuông
		addStyle(`
        button {
            border-radius: 0 !important;
        }
        input {
            border-radius: 0 !important;
        }
        textarea {
            border-radius: 0 !important;
        }
        select {
            border-radius: 0 !important;
        }
        [role="button"], [role="button"] *, [role="link"], [role="link"] *, [role="dialog"], [role="dialog"] *, [role="menu"], [role="menu"] *, [role="listbox"], [role="listbox"] * {
            border-radius: 0 !important;
        }
		.mainPost{
			margin: 0 !important;
			padding: 0 !important;
			justify-content: start;
			width: fit-content;
		}	
		[role="complementary"] {
			border: 1px solid #ccc !important;
		}
		.badge {
			position: absolute;
			top: -1px;
			right: -4px;
			background-color: red;
			color: white;
			font-size: 8px;
			width: 12px;
			height: 12px;
			justify-content: center;
			align-items: center;
			border-radius: 9999px;
			line-height: 12px;
			text-align: center;
			font-weight: bold;
			pointer-events: none;
			user-select: none;
		}
    `);
		hideNavBar();
		replaceNavBar();
		listenModel();
		shortcutNavBar();
		listenChangePath();
		listenDomUpdateOnly();
	};
	init();
})();
