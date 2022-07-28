import {Header, Footer} from 'hollyburn-lib';

export default function Layout({children}) {
    return (
        <>
            <Header showMenu={true} />
            <div className={"relative"}>
                {children}
            </div>
            <Footer />
        </>
    )
}