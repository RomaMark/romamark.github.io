export function logoutUser() {
  sessionStorage.removeItem("JWT");
  window.location.href = "index.html";
}
