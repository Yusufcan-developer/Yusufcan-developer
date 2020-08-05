// hooks.js
import { useState, useEffect } from "react";

function usePostUser(url, reqBody) {
    const [data, setData] = useState([]);
    const [userId, setUserId] = useState();
    const [loading, setLoading] = useState(true);
    const [onChange, setOnChange] = useState(false);
    const [username, setUsername] = useState();
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const [email, setEmail] = useState();
    const [isLocked, setIsLocked] = useState();
    const [role, setRole] = useState();
    const [dealerCodes, setDealerCodes] = useState();
    const [regionCodes, setRegionCodes] = useState();
    const [fieldCodes, setFieldCodes] = useState();

    async function fetchUrl() {
        const reqB = reqBody == null || reqBody == undefined ? {
            "Id": userId, "firstName": firstName, "lastName": lastName, "username": username,
            "isLocked": isLocked, "role": role, "email": email, "dealerCodes": dealerCodes, "regionCodes": regionCodes, "fieldCodes": fieldCodes
        } : reqBody;
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
            },
            body: JSON.stringify(reqBody)
        };
        await fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
                setOnChange(false);
            }).catch(error => console.log('hata', error));
    }
    useEffect(() => {
        setLoading(true);
        if (reqBody.Id != -1) {
            fetchUrl();
        }
    }, [onChange]);
    return [data, loading, setOnChange];
}
export { usePostUser };
