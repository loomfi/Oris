import '@/css/platform/profile.css'
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as jwt from "jose"
import * as crypto from "crypto"
import { db } from "@/db/db"
import { account } from "@/db/schema"
import { eq } from "drizzle-orm"
import Link from 'next/link'
import { PlatformNavbar } from '@/components/platform/PlatformNavbar'
import { PlatformSidebar } from '@/components/platform/PlatformSidebar'
import { Button } from '@mantine/core'
import Image from 'next/image'
import { Briefcase, Edit2 } from 'react-feather'


export default async function Profile(args: any) {
    // Save profile info
    // Get cookies
    let token = cookies().get('horizon_token')
    if (token == undefined) {
        return redirect('/platform/account')
    }
    // Grabs the JWT
    // @ts-ignore
    let token_info = await jwt.jwtVerify(token['value'], crypto.createSecretKey(process.env.JWT_Secret, 'utf-8'))
    // Since the payload has an email, the email is our identifier.
    let email = token_info['payload']['email']
    // Now we have account information.
    // @ts-ignore
    let account_info = await db.select().from(account).where(eq(account.email, email))
    // grab profile info
    // @ts-ignore
    if (account_info[0].organization == null && account_info[0].image_url == null && account_info[0].first_name == null && account_info[0].last_name == null && account_info[0].user_role == null) {
        if (args['searchParams']['welcome'] == undefined) {
            redirect('/platform/?welcome=true')
        }
    }
    return redirect('/platform/profile/' + account_info[0].id)
}