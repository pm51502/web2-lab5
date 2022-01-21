var subButton = document.querySelector('#subscribe-btn');

if("Notification" in window && "serviceWorker" in navigator) {
    subButton.addEventListener("click", function() {
        Notification.requestPermission(async function(res) {
            console.log(`Request permission result: ${res}`);
            if (res === "granted") {
                await setupSubscription();
            } else {
                console.log(`User denied push notifs: ${res}`);
            }
        });
    });
} else {
    btnNotif.setAttribute("disabled", "");
}

function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function setupSubscription() {
    try {
        let reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();

        if(sub === null) {
            var publicKey = "BPblsso_Fx85SIvFmxDHkkIUDCaGSyt_tELJJwvCnpaPUKgQabcYdrwDAqg4_1Iqp3ynpa_r1FWiJXB53gCVU08";
            
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            fetch("/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({sub: sub})
            }).then(res => {
                console.log(JSON.stringify(sub));
                if(res.ok) {
                    alert(`subscription saved:\n ${JSON.stringify(sub)}`);
                }
            });
        } else {
            alert(`already subscribed:\n ${JSON.stringify(sub)}`);
        }
    } catch(error) {
        console.log(error);
    }
}