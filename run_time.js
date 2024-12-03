function updateTime() {
  const date1 = "2019/07/17 00:00:00";
  const date2 = new Date();
  const date3 = date2.getTime() - new Date(date1).getTime();
  const days = Math.floor(date3 / (24 * 3600 * 1000));
  const leave1 = date3 % (24 * 3600 * 1000);
  const hours = Math.floor(leave1 / (3600 * 1000));
  const leave2 = leave1 % (3600 * 1000);
  const minutes = Math.floor(leave2 / (60 * 1000));
  const leave3 = leave2 % (60 * 1000);
  const seconds = Math.round(leave3 / 1000);
  const element = document.getElementById("run-time");
  element.innerHTML =
    "已运行" + days + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒";
}

setInterval(updateTime, 1000);
