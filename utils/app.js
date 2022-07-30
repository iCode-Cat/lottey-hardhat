fetch("https://lift.vfsglobal.com/globalappointment/api/v2.0/appointment/schedule", {
    headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,tk;q=0.8,tr;q=0.7",
        authorize:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiSW5kaXZpZHVhbCIsInVzZXJJZCI6Im91SDNrL21DSFk1cG1pckpLeXhwZEE9PSIsImVtYWlsIjoiYXdQc3BxUnowaElMOVk3aktOeGhqRU5sK0VRV1gzT3gweCtTem5JRVpEMmhGeW56ejNKZGlnQTlFZHJMR1FXbiIsIm5iZiI6MTY1OTAxOTg2MiwiZXhwIjoxNjU5MDI1ODYyLCJpYXQiOjE2NTkwMTk4NjJ9.Hl5yQW_wZKwIEnVm69LEWKlRz7zlCy1uY0L8-iil_Zg",
        "cache-control": "no-cache",
        "content-type": "application/json;charset=UTF-8",
        pragma: "no-cache",
        route: "tur/en/pol",
        "sec-ch-ua": '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://visa.vfsglobal.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: '{"missionCode":"pol","countryCode":"tur","cultureCode":"en-US","centerCode":"PHARB","loginUser":"devranboyac8@gmail.com","urn":"PLTR14565635482","paymentdetails":{"paymentmode":"Online","RequestRefNo":"","clientId":"","merchantId":"","amount":244.5,"currency":"TRY"},"allocationId":"8494566","CanVFSReachoutToApplicant":false}',
    method: "POST",
})
