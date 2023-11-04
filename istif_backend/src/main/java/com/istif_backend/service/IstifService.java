package com.istif_backend.service;

import com.istif_backend.model.Comment;
import com.istif_backend.model.Istif;
import com.istif_backend.model.User;
import com.istif_backend.repository.IstifRepository;
import com.istif_backend.request.IstifCreateRequest;
import com.istif_backend.request.IstifEditRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class IstifService {
    @Autowired
    IstifRepository istifRepository;

    @Autowired
    CommentService commentService;

    @Autowired
    UserService userService;

    @Autowired
    ImageService imageService;

    public List<Istif> findAll(){
        return istifRepository.findAll();
    }

    public List<Istif> findAllByOrderByIdDesc(){
        return istifRepository.findAllByOrderByIdDesc();
    }

    public Istif createIstif(User foundUser, IstifCreateRequest istifCreateRequest) throws ParseException, IOException {
        Istif createdIstif = Istif.builder()
                .title(istifCreateRequest.getTitle())
                .labels(istifCreateRequest.getLabels())
                .text(imageService.parseAndSaveImages(istifCreateRequest.getText()))
                .user(foundUser)
                .createdAt(new Date())
                .likes(new HashSet<>())
                .build();
        return istifRepository.save(createdIstif);

    }

    public List<Istif> findAllStoriesByUserId(Long userId){
        return istifRepository.findByUserId(userId);
    }

    public List<Istif> findByUserIdOrderByIdDesc(Long userId){
        return istifRepository.findByUserIdOrderByIdDesc(userId);
    }


    public Istif getIstifByIstifId(Long id) {
        Optional<Istif> optionalIstif = istifRepository.findById(id);
        if (optionalIstif.isEmpty()) {
            throw new NoSuchElementException("Istif with id '" + id + "' not found");
        }
        return optionalIstif.get();
    }

    public List<Istif> findFollowingStories(User foundUser) {
        Set<User> followingList = foundUser.getFollowing();
        List<Long> idList = new ArrayList<>();
        List<Istif> istifList = new ArrayList<>();
        for (User user : followingList){
            idList.add(user.getId());
        }
        for(Long id : idList){
            istifList.addAll(findByUserIdOrderByIdDesc(id));
        }
        return istifList;

    }


    public Istif likeIstif(Long istifId,Long userId){
        Istif istif = getIstifByIstifId(istifId);
        User user = userService.findByUserId(userId);
        Set<Long> likesList = istif.getLikes();
        Set<Long> likedList = user.getLikedIstifs();
        if(!likesList.contains(user.getId())){
            likesList.add(user.getId());
            likedList.add(istifId);
        }
        else{
            likesList.remove(user.getId());
            likedList.remove(istifId);
        }
        istif.setLikes(likesList);
        user.setLikedIstifs(likedList);
        userService.editUser(user);
        return istifRepository.save(istif);
    }

    public Set<Istif> searchStoriesWithQuery(String query) {
        Set<Istif> istifSet = new HashSet<>();
        istifSet.addAll(istifRepository.findByTitleContainingIgnoreCase(query));
        istifSet.addAll(istifRepository.findByLabelsContainingIgnoreCase(query));
        return istifSet;
    }

    public List<Istif> searchStoriesWithCreationDate(String createdAt) throws ParseException {
        Date formattedDate = stringToDate(createdAt);
        return istifRepository.findByCreatedAt(formattedDate);
    }

    public String deleteByIstifId(Istif istif) {
        List<Comment> commentList = istif.getComments();
        for (Comment comment: commentList) {
            commentService.deleteComment(comment);
        }
        istifRepository.deleteById(istif.getId());
        return "deleted";
    }

    public Date stringToDate(String timeStamp) throws ParseException{
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        return dateFormat.parse(timeStamp);
    }

    public Istif enterIstif(User foundUser, IstifEditRequest istifEditRequest) throws ParseException, IOException {
        return Istif.builder()
                .title(istifEditRequest.getTitle())
                .labels(istifEditRequest.getLabels())
                .text(imageService.parseAndSaveImages(istifEditRequest.getText()))
                .user(foundUser)
                .createdAt(new Date())
                .likes(new HashSet<>())
                .build();
    }

    public Istif editIstif(IstifEditRequest request, User user, Long istifId) throws ParseException, IOException {
        Istif istif = getIstifByIstifId(istifId);
        if(Objects.equals(istif.getUser().getId(),user.getId())){
            Istif enteredIstif = enterIstif(user,request);
            enteredIstif.setId(istifId);
            enteredIstif.setLikes(istif.getLikes());
            enteredIstif.setId(istif.getId());
            enteredIstif.setComments(istif.getComments());
            return istifRepository.save(enteredIstif);
        }
        return null;
    }

    public List<Istif> likedStories(User foundUser) {
        List<Long> likeList = new ArrayList<>(foundUser.getLikedIstifs());
        List<Istif> istifList = new ArrayList<>();
        for (Long istifId : likeList) {
            Istif istif = getIstifByIstifId(istifId);
            if (istif != null) {
                istifList.add(istif);
            }
        }
        return istifList;
    }
}
