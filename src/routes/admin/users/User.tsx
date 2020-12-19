import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from "react-router-dom";
import { userSelector, fetchUser } from '../../../store/slices/users';

import { Heading3, Heading4, Heading5, Subtitle, Body1 } from '../../../components/Typography';

import { formatPhone } from '../../../utils/formatters';

function User(props) {

    const { userId } = useParams<{ userId: string }>();

    const dispatch = useDispatch();
    const user = useSelector(userSelector(userId));

    useEffect(() => {
        dispatch(fetchUser(userId));
    }, []);

    return <>
        {user && (
            <>
                <div className="flex flex-row mb-8">
                    {user.photoUrl && (
                        <div className="flex flex-wrap content-center mr-6 ">
                            <img className="h-40 w-40 shadow-lg rounded-full" src={user.photoUrl} alt={`${user.first} ${user.last}`}></img>
                        </div>
                    )}
                    <div className="pb-2 flex flex-col justify-center">
                        <Heading4>{user.first} {user.last}</Heading4>
                        <Subtitle>⭐⭐⭐⭐⭐</Subtitle>

                        <hr className="mt-3 mb-2"/>
                        
                        <Subtitle>@{user.username}</Subtitle>
                        <Subtitle><a href={`mailto:${user.email}`}>{user.email}</a></Subtitle>
                        <Subtitle>{formatPhone(user.phone)}</Subtitle>
                        <Body1>{user.id}</Body1>
                    </div>
                </div>

                <div className="flex flex-row">
                    <div className="flex-grow">
                        <Heading5>Beep history</Heading5>
                    </div>

                    <div className="flex-grow">
                        <Heading5>Ride history</Heading5>
                    </div>
                </div>
            </>
        )}
    </>;
}

export default User;
