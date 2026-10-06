import React , {useState} from 'react';

import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Flathelp from '../components/flat-help';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import { Link } from "react-router-dom";

import img1 from '../assets/images/icon/check.png';
import img2 from '../assets/images/blog/blog-detail-4.png';

import img3 from '../assets/images/avatar/avt-01.png';
import img4 from '../assets/images/avatar/avt-02.png';
import img5 from '../assets/images/avatar/avt-03.png';

function InterviewReport(props) {

    const [dataRecent] = useState(
        [
            {
                img: img1,
                title: 'Art Dsign',
            },
            {
                img: img1,
                title: 'UX/UI Design',
            },
            {
                img: img1,
                title: 'Web Design',
            }
        ]
    )
    const [dataServices] = useState(
        [
            {
                id: 1,
                text: 'UX Strategy',
                link : '/blog',
            },
            {
                id: 2,
                text: 'Information Architecture',
                link : '/blog',
            },
            {
                id: 3,
                text: 'Prototyping',
                link : '/blog',
            },
            {
                id: 4,
                text: 'Wireframing',
                link : '/blog',
            },
            {
                id: 5,
                text: 'UI Design',
                link : '/blog',
            },
            {
                id: 6,
                text: 'Figma Design',
                link : '/blog',
            }
        ]
    )
    

    const [dataComment] = useState(
        [
            {
                img: img2,
                name: ' Monsur Rahman Lito',
                content: 'Phasellus ac consequat turpis, sit amet fermentum nulla. Donec dignissim augue nunc. Praesent bibendum erat ac lectus molestie lobortis. Curabitur ultrices justo ac leo facilisis tincidunt. Maecenas et dui eget nisl ornare scelerisque.',
            },
            {
                img: img2,
                name: ' Monsur Rahman Lito',
                content: 'Phasellus ac consequat turpis, sit amet fermentum nulla. Donec dignissim augue nunc. Praesent bibendum erat ac lectus molestie lobortis. Curabitur ultrices justo ac leo facilisis tincidunt. Maecenas et dui eget nisl ornare scelerisque.',
            },
        ]
    )

    const [dataCard] = useState(
        [
            {
                id: 1,
                img: img3,
                title: 'Axtronic Electronics VS-10',
                author: ' Themesflat',
                date: '04/10/2022',
            },
            {
                id: 2,
                img: img4,
                title: 'Axtronic Electronics VS-10',
                author: ' Themesflat',
                date: '04/10/2022',
            },
            {
                id: 3,
                img: img5,
                title: 'Axtronic Electronics VS-10',
                author: ' Themesflat',
                date: '04/10/2022',
            },
        ]
    )

    return (
        <div className='wrapper-style' id='wrapper'>
            <div className="tf-section flat-blog-details ">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-12">
                            <article className="post">
                                <div className="inner-content">
                                    <div className="media style">
                                        <img src={require ('../assets/images/blog/blog-detail-1.jpg')} alt="Nufti"/>                       
                                    </div>
                                    <h2 className="title">Axtronic Electronics VS-10</h2>
                                    <div className="sc-card-article">
                                        <div className="meta-info style">
                                            <div className="author">
                                                <div className="avatar">
                                                    <img src={require ('../assets/images/avatar/avt-01.png')} alt="Nufti"/>
                                                </div>
                                                <div className="info">
                                                    <h5> By<Link className="text-color-3" to="author-profile.html"> Themesflat</Link> </h5>
                                                    <div className="date"> Date <span> 04/10/2022</span></div>                                           
                                                </div>
                                            </div>                                  
                                        </div>
                                    </div>
                
                                    <p className="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut venenatis sagittis tortor,
                                        in convallis justo sagittis et. Nunc placerat risus sem, vitae dictum libero laoreet 
                                        sit amet. Suspendisse semper leo nec justo aliquam venenatis. Aliquam vitae lorem sed 
                                        orci vulputate porta. Vestibulum ut elit eget arcu tincidunt sollicitudin quis sed augue. 
                                        Aenean nibh nunc, elementum a dolor vel, vestibulum commodo dui. Donec id felis a ipsum 
                                        molestie tincidunt. Nunc ullamcorper quam nunc, eget laoreet dui pharetra eget. Aenean 
                                        viverra interdum condimentum. Cras mollis, arcu vel fermentum auctor, neque velit pharetra 
                                        sapien, sed consectetur nulla mi id nunc. Pellentesque habitant morbi tristique senectus et 
                                        netus et malesuada fames ac turpis egestas. Nulla accumsan, nulla non molestie vehicula, mi 
                                        ipsum ultrices arcu, ac vehicula odio sem non enim.</p>
                                    <div className="img-box">
                                        <div className="wrap-check">
                                            {
                                                dataRecent.map((item,index) => (
                                                    <ul className="check" key={index}>
                                                        <li><img src={item.img} alt="images" /></li>
                                                        <li><h3>{item.title}</h3></li>
                                                    </ul>
                                                ))
                                            }
                                        </div>                                       
                                        <div className="img-blog">
                                            <div className="media">
                                                <img src={require ('../assets/images/blog/blog-detail-2.jpg')} alt="Nufti"/>
                                            </div>
                                        </div>
                                    </div>   
                                    
                                    <p className="text">Phasellus ac consequat turpis, sit amet fermentum nulla. Donec dignissim augue nunc. Praesent 
                                        bibendum erat ac lectus molestie lobortis. Curabitur ultrices justo ac leo facilisis tincidunt.</p>

                                    <div className="post-image">
                                        <div className="thumb">
                                            <img src={require ('../assets/images/blog/blog-detail-3.png')} alt="Nufti"/>
                                        </div>                  
                                        <div className="box-title">
                                            <div className="title-author text-color-3">Bentin Ali Benilmal</div>
                                            <p>Fusce sodales egestas neque pulvinar enim ultrdicies atsa. Vivamus vitae conse ejkpolit. Praesent 
                                                lacindsia tincidudnt variuss Vestibulum ante thfe ipsum innusant.</p>
                                        </div>
                                    </div> 
                                    <p className="text-1">Sed nec sapien eu nibh porta fringilla. Aenean in lectus id tellus tempus rutrum vitae a elit. Nulla sit amet 
                                        interdum ligula. Duis bibendum porttitor tempus. Morbi nisi nisl, sagittis in enim at, tempus convallis magna. 
                                        Nam malesuada risus non congue viverra. Nullam ultrices massa orci, in eleifend diam fringilla.</p>  

                                    <div className="font-20 mb-15">Advice To Grow Businesses</div>
                                    <p className="mb-36">Sed nec sapien eu nibh porta fringilla. Aenean in lectus id tellus tempus rutrum vitae a elit. Nulla sit amet interdum 
                                        ligula. Duis bibendum porttitor tempus. Morbi nisi nisl, sagittis in enim at, tempus convallis magna. Nam malesuada risus 
                                        non congue viverra. Nullam ultrices massa orci, in eleifend diam fringilla a. Maecenas eu dignissim nulla. Morbi aliquet 
                                        luctus massa fermentum pulvinar. Fusce vel dictum magna.</p>

                                    <div className="font-20 mb-15">Advice To Businesses Start</div>
                                    <p className="text-boder">Suspendisse purus erat, semper laoreet eros sed, vehicula aliquet quam. Maecenas eget arcu sapien. Nam convallis sit amet lacus ut
                                    tristique. Ut posuere risus ipsum, sit amet efficitur eros varius eu. Cras placerat lacus purus, facilisis volutpat urna tincidunt quis.</p>
                                    <div className="infor-row flex">
                                        <div className="tags flex">
                                            <h4 className="">Tag Here</h4>
                                            <div className="flex font">
                                                <Link to="#">Creative</Link>
                                                <Link to="#" className="activ">Agency</Link>
                                                <Link to="#">Business</Link>
                                            </div>                                         
                                        </div> 
                                        <div className="widget-social style-1 icon-blog">
                                            <ul>
                                                <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
                                                <li><Link to="#"><i className="fab fa-instagram"></i></Link></li>                                                               
                                                <li><Link to="#"><i className="fab fa-dribbble"></i></Link></li>
                                                <li><Link to="#"><i className="fab fa-behance"></i></Link></li>                                  
                                            </ul>
                                        </div> 
                                    </div>                                                                                                          
                                 </div>  
                                 <div id="comments">
                                    <div className="title-comment font-20-600">02 Comments</div>
                                    <p className="mb-36"> Nunc velit metus, volutpat elementum euismod eget, cursus nec nunc.</p>   
                                    <ol className="comment-list">
                                            {
                                                dataComment.map((item,index) => (
                                                    <li className="comment-01 flex mb-44" key={index}>
                                                        <div className="comment-avatar">
                                                            <img src={item.img} alt="images" />
                                                        </div>
                                                        <div className="comment-content">
                                                            <div className="comment-meta">                                                  
                                                                <div className="comment-author mb-18"><h3>{item.name} </h3></div>                                                                                                                                                 
                                                            </div>
                                                            <div className="comment-text">
                                                                <p>{item.content}</p>
                                                            </div>
                                                            <div className="comment-icon font flex link-style-1">
                                                                <Link to="#" className="icon icon-one">Reply</Link>
                                                                <Link to="#" className="icon icon-two">Love </Link>
                                                            </div>
                                                        </div>
                                                    </li>  
                                                ))
                                            }
                                    </ol>
                                    <div id="respond" className="respond-comment">
                                        <div className="title-comment2 font-20-600">Good Comments</div>
                                        <p className="text"> Nunc velit metus, volutpat elementum euismod eget, cursus nec nunc.</p>  
                                        <form id="contactform" className="comment-form form-submit"
                                            action="#" method='post' acceptCharset="utf-8"
                                            >
                                            <div className="text-wrap clearfix">
                                                <fieldset className="name-wrap style-text">
                                                    <input type="text" id="name" className="tb-my-input" name="name"
                                                        tabIndex="1" placeholder="Your Full Name" size="32"
                                                     required />
                                                </fieldset>
                                                <fieldset className="email-wrap style-text">
                                                    <input type="email" id="email" className="tb-my-input" name="email"
                                                        tabIndex="2" placeholder="info.lawlead@gmail.com" size="32"
                                                     required />
                                                </fieldset>
                                                <fieldset className="phone-wrap style-text">
                                                    <input type="number" id="phone" className="tb-my-input" name="phone"
                                                        tabIndex="1" placeholder="+55 (121) 234 444" size="32"
                                                     required />
                                                </fieldset>
                                                <fieldset className="site-wrap style-text">
                                                    <input type="text" id="site" className="tb-my-input" name="site"
                                                        tabIndex="1" placeholder="Enter Your Address" size="32"
                                                     required />
                                                </fieldset>
                                            </div>
                                            <fieldset className="message-wrap">
                                                <textarea id="comment-message" name="message" rows="3" tabIndex="4"
                                                    placeholder="Additional Message"
                                                 required></textarea>
                                            </fieldset>
                                            <p className="text-call"> Call us 24/7 at 869-5414-5 or fill out the form below to receive a free and
                                                confidential initial consultation.</p>
                                            <button name="submit" type="submit" id="comment-reply"
                                                className="button btn-submit-comment"><span>Submit Now </span></button>
                                        </form>
                                    </div>
                                </div>                             
                            </article>        
                        </div>
                        <div className="col-lg-4 col-md-12">
                            <aside className="side-bar">
                                <div className="inner-side-bar">                                       
                                    <div className="widget search">
                                        <div className="widget-title title-search">
                                            Search Here                                    
                                        </div>
                                        <form action="#" method="get" role="search" className="search-form">
                                            <input type="search" className="search-field"
                                                placeholder="Enter Your Keyword..." name="s"
                                                title="Search for" required="" />
                                            <button className="search-icon search-submit" type="submit" title="Search"></button>
                                        </form>
                                    </div>
                                    <div className="widget widget-categories style"> 
                                        <div className="widget-title title-list">
                                            Services List
                                        </div>                                                                                                                        
                                        <ul>
                                            {
                                                dataServices.map((item,index) => (
                                                    <li  key={index}>
                                                        <Link to={item.link}>{item.text}</Link>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                    <div className="widget style2">
                                        <div className="widget-title title-icon">
                                            Social Icon
                                        </div>   
                                        <div className="widget-social style-2">
                                            <ul className="icon-box">
                                                <li><Link to="#"><i className="fab fa-facebook"></i></Link></li>
                                                <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>
                                                <li><Link to="#"><i className="fab fa-instagram"></i></Link></li>                                                               
                                                <li><Link to="#"><i className="fab fa-dribbble"></i></Link></li>                                                                          
                                            </ul>
                                        </div>                                                                                                
                                    </div>
                                    
                                    <div className="widget style">
                                        <div className="widget-title title-new">
                                            Latest News
                                        </div>
                                            {
                                                dataCard.map((item,index) => (
                                                    <div className="sc-card-article" key={index}>
                                                        <h3><Link to="/blog">{item.title}</Link></h3>
                                                        <div className="meta-info style">
                                                            <div className="author">
                                                                <div className="avatar">
                                                                    <img src={item.img} alt="" />
                                                                </div>
                                                                <div className="info">
                                                                    <h5> By<Link className="text-color-3" to="/author">{item.author}</Link> </h5>
                                                                    <div className="date"> Date <span>{item.date}</span></div>                                           
                                                                </div>
                                                            </div>                                  
                                                        </div>
                                                    </div> 
                                                ))
                                            }
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
            {<Flathelp />}
            {<Footer data={dataFooter}/>}
            {<Bottom classection='widget-social-footer'/>}
        </div>
    );
}

export default BlogDetails;